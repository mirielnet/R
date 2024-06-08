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
      name: 'ありす',
      links: {
        GitHub: 'https://github.com/16467',
        Misskey: 'https://miraiskey.net/@164',
        Discord: '@16467',
        Mail: 'master@164-67.sbs',
      },
      icon: 'https://miraiskey.net/files/d2c26aeb-0f33-4a05-8801-6372e903c9dc',
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
