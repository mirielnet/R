const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('neko')
    .setDescription('Neko画像をランダムに取得します。'),

  async execute(interaction) {
    // ここにNekoBot APIのURLを記述してください
    const apiUrl = 'https://nekobot.xyz/api/image?type=neko';

    try {
      const response = await axios.get(apiUrl);

      const embed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Neko画像')
        .setImage(response.data.message);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('画像の取得中にエラーが発生しました。');
    }
  },
};
