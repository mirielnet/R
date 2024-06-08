const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kuronekoyamato')
    .setDescription('クロネコヤマトの追跡番号を調べて表示します。')
    .addStringOption(option =>
      option.setName('追跡番号')
        .setDescription('クロネコヤマトの追跡番号')
        .setRequired(true)
    ),

  async execute(interaction) {
    const trackingNumber = interaction.options.getString('追跡番号');

    try {
      const response = await axios.get(`http://nanoappli.com/tracking/api/${trackingNumber}.json`);

      const jsonData = response.data;
      const resultCode = parseInt(jsonData.result);

      let embed;
      if (resultCode === 0) {
        const statusList = jsonData.statusList;
        const latestStatus = statusList[statusList.length - 1];

        embed = new MessageEmbed()
          .setColor('#00ff00')
          .setTitle(`クロネコヤマト 追跡番号: ${jsonData.slipNo}`)
          .setDescription(`最新の配送状況: ${latestStatus.status}`)
          .addField('お届け予定日', latestStatus.date || '情報なし')
          .addField('お届け先', jsonData.destination || '情報なし')
          .addField('配達担当', latestStatus.placeName || '情報なし')
          .addField('荷物の詳細', latestStatus.placeCode || '情報なし');
      } else {
        embed = new MessageEmbed()
          .setColor('#ff0000')
          .setTitle(`クロネコヤマト 追跡番号: ${trackingNumber}`)
          .setDescription('追跡番号が誤っているか未登録です。');
      }

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      interaction.reply('追跡番号の情報を取得する際にエラーが発生しました。');
    }
  },
};
