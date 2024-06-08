const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('animal')
    .setDescription('ランダムな動物の画像を表示します。'),

  async execute(interaction) {
    try {
      const response = await axios.get('https://source.unsplash.com/featured/?animal');

      const embed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('ランダムな動物の画像')
        .setImage(response.request.res.responseUrl);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('動物の画像を取得する際にエラーが発生しました。');
    }
  },
};
