// commands/master.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('master')
    .setDescription('ボット作成者に関する情報を表示します。'),
  async execute(interaction) {
    // ボット管理者の実際の情報に置き換えてください
    const masterInfo = {
      name: 'Miriel',
      links: {
        GitHub: 'https://github.com/mirielnet',
        Misskey: 'https://rosekey.jp/@miriel',
        Discord: '@miriel.net',
        Mail: 'me@miriel.net',
      },
      icon: 'https://rosekey.jp/files/7505ae80-9bb5-4d75-a143-caf96a3f17dc',
    };

    // 情報を表示するためのEmbedを作成
    const embed = new MessageEmbed()
      .setTitle('ボット作成者の情報')
      .addField('名前', masterInfo.name)
      .addField('リンク集', 
        `GitHub: ${masterInfo.links.GitHub}\n` +
        `Misskey: ${masterInfo.links.Misskey}\n` +
        `Discord: ${masterInfo.links.Discord}\n` +
        `Mail: ${masterInfo.links.Mail}`
      )
      .setThumbnail(masterInfo.icon); // アイコンを設定

    // Embedで返信
    await interaction.reply({ embeds: [embed] });
  },
};
