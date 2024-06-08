const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('zipcode')
    .setDescription('郵便番号で住所を検索します。')
    .addStringOption(option =>
      option.setName('郵便番号')
        .setDescription('検索する郵便番号（ハイフンなしの7桁）')
        .setRequired(true)),

  async execute(interaction) {
    const zipcode = interaction.options.getString('郵便番号');
    const apiUrl = `https://postcode.teraren.com/postcodes/${zipcode}.json`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data.postcode_type === 'area') {
        const { prefecture_kana, city_kana, suburb_kana, prefecture, city, suburb } = response.data;
        const embed = new MessageEmbed()
          .setColor('#00ff00')
          .setTitle('郵便番号詳細検索結果')
          .setDescription(`郵便番号: ${zipcode}\n住所: ${prefecture_kana}${city_kana}${suburb_kana} ${prefecture}${city}${suburb}`);

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply('該当する住所が見つかりませんでした。正しい7桁の郵便番号を入力してください。');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply('郵便番号の検索中にエラーが発生しました。');
    }
  },
};
