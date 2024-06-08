const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

// Function to check if the input is a valid IP address
function isValidIPAddress(input) {
  // Regular expression to validate IP address
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipRegex.test(input);
}

// Function to check if the IP address is in the reserved range
function isReservedIP(ip) {
  // Check if IP address is 0.0.0.0 or in the 127.0.0.0/8 range
  if (ip === '0.0.0.0' || /^127\./.test(ip)) {
    return true;
  }

  // Check if IP address is in the local IP address range (A, B, or C class)
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(ip)) {
    return true;
  }

  return false;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pingremote')
    .setDescription('指定したIPアドレスやドメインの可用性を確認します。')
    .addStringOption(option =>
      option
        .setName('target')
        .setDescription('Ping送信先のIPアドレスやドメインを指定してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    // レスポンスを遅延
    await interaction.deferReply();

    const target = interaction.options.getString('target');
    
    // URLの形式をチェック
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      await interaction.editReply('無効なURLです。http:// または https:// から始まるURLを指定してください。');
      return;
    }

    // IPアドレスが妥当かチェック
    const isIP = isValidIPAddress(target);

    // 予約済みのIPアドレスかlocalhostのチェック
    if ((isIP && isReservedIP(target)) || target === 'localhost') {
      await interaction.editReply(`指定したIPアドレスには送信できません。\nIPアドレス/ドメイン: ${target}`);
      return;
    }

    try {
      const startTime = Date.now();
      const response = await fetch(target);
      const endTime = Date.now();
      const status = response.status;
      const responseTime = endTime - startTime;
      let result = '';

      if (response.headers.has('server') && response.headers.get('server').includes('cloudflare')) {
        result += 'このサイトは、Cloudflareを利用しています。\n';
      }

      // 新しく追加した特定のサイトのチェック
      const trustedSites = [
        'https://sda2.net',
        'https://russkey.sda2.net',
        'https://256server.com',
        'https://rumiserver.com'
      ];

      if (trustedSites.includes(target)) {
        result += 'このサイトは、認証済みサイトに登録されています。\n確認された安全なサイトです。\n';
      }

      if (status === 200) {
        const text = await response.text();

        if (text.includes('Misskey') || text.includes('CherryPick')) {
          const nodeInfoUrl = `${target}/nodeinfo/2.0`;
          const nodeInfoResponse = await fetch(nodeInfoUrl);
          const nodeInfoData = await nodeInfoResponse.json();

          if (nodeInfoData.software && nodeInfoData.software.name && nodeInfoData.software.version) {
            const name = nodeInfoData.software.name;
            const version = nodeInfoData.software.version;

            result += `このサイトは、Misskeyを利用したinstanceです。\nSoftware名: ${name}\nVersion: ${version}\n`;

            if (nodeInfoData.metadata) {
              if (nodeInfoData.metadata.nodeName) {
                result += `Instance名: ${nodeInfoData.metadata.nodeName}\n`;
              }

              if (nodeInfoData.metadata.maintainer && nodeInfoData.metadata.maintainer.name) {
                result += `管理者名: ${nodeInfoData.metadata.maintainer.name}\n`;
              }

              if (nodeInfoData.metadata.maintainer && nodeInfoData.metadata.maintainer.email) {
                result += `お問い合わせメール: ${nodeInfoData.metadata.maintainer.email}\n`;
              }

              if (nodeInfoData.metadata.tosUrl) {
                result += `利用規約URL: ${nodeInfoData.metadata.tosUrl}\n`;
              }

              if (nodeInfoData.metadata.repositoryUrl) {
                result += `リポジトリURL: ${nodeInfoData.metadata.repositoryUrl}\n`;
              }

              if (nodeInfoData.metadata.feedbackUrl) {
                result += `フィードバックURL: ${nodeInfoData.metadata.feedbackUrl}\n`;
              }

              if (nodeInfoData.metadata.openRegistrations !== undefined) {
                result += `登録が可能: ${nodeInfoData.metadata.openRegistrations}\n`;
              }
            }
          }
        } else {
          result += 'このサイトは、MisskeyやCherryPickを利用したinstanceではありません。\n';
        }

        result = `Ping結果:\nステータスコード: ${status}\nドメイン: ${target}\n応答時間: ${responseTime}ミリ秒\n\n${result}`;

        const embed = new MessageEmbed()
          .setTitle('Ping結果')
          .setColor(status === 200 || status === 418 ? '#00FF00' : '#FF0000')
          .setURL(target)
          .setThumbnail(`https://i.imgur.com/xDwlEAK.png`) // アイコンのURL
          .setDescription(result);

        await interaction.editReply({ embeds: [embed] });
      } else if (status === 418) {
        result = `Ping結果:\nステータスコード: ${status}\nドメイン: ${target}\nメッセージ: I'm a teapot`;

        const embed = new MessageEmbed()
          .setTitle('Ping結果')
          .setColor('#00FF00')
          .setDescription(result);

        await interaction.editReply({ embeds: [embed] });
      } else {
        result = `Ping結果:\nステータスコード: ${status}\nドメイン: ${target}\nサイトがアクティブではありません`;

        const embed = new MessageEmbed()
          .setTitle('Ping結果')
          .setColor('#FF0000')
          .setDescription(result);

        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply('Pingの送信中にエラーが発生しました。');
    }
  },
};
