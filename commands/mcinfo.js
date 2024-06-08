const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcinfo')
    .setDescription('Minecraftサーバーの詳細情報を取得します。')
    .addStringOption(option =>
      option
        .setName('server')
        .setDescription('MinecraftサーバーのIPアドレスやドメインを指定してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    let server = interaction.options.getString('server');
    const apiEndpoint = `https://api.mcsrvstat.us/2/${server}`;
    const iconEndpoint = `https://api.mcsrvstat.us/icon/${server}`;

    try {
      const [response, iconResponse] = await Promise.all([
        fetch(apiEndpoint),
        fetch(iconEndpoint),
      ]);

      const data = await response.json();

      // APIの応答がオフラインであるかを確認
      if (!data.online) {
        await interaction.editReply('指定されたMinecraftサーバーはオフラインです。');
        return;
      }

      const iconBuffer = iconResponse.ok ? await iconResponse.buffer() : null;

      const embed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle(`${server} の詳細情報`);

      if (data.ip) {
        embed.addField('IPアドレス', data.ip);
      }

      if (data.port) {
        embed.addField('ポート', data.port.toString());
      }

      if (data.players && data.players.online && data.players.max) {
        embed.addField('プレイヤー人数', `${data.players.online}/${data.players.max}`);
      }

      if (data.version) {
        embed.addField('バージョン', data.version);
      }

      if (data.software) {
        embed.addField('サーバーソフトウェア', data.software);
      }

      if (data.motd && data.motd.clean) {
        embed.addField('説明欄', data.motd.clean.join('\n'));
      }

      if (iconBuffer) {
        const iconAttachment = new MessageAttachment(iconBuffer, 'server_icon.png');
        embed.setThumbnail('attachment://server_icon.png');
        await interaction.editReply({ embeds: [embed], files: [iconAttachment] });
      } else {
        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply('Minecraftサーバーの情報を取得する際にエラーが発生しました。');
    }
  },
};