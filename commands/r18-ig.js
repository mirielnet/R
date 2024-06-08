const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: {
    name: 'r18-ig',
    description: 'NekoBot APIからR18画像をランダムに取得します。',
    options: [
      {
        type: 'STRING',
        name: 'type',
        description: '取得する画像のタイプ',
        required: true,
        choices: [
          { name: '一般の画像(R18)', value: 'pgif' },
          { name: 'Neko画像', value: 'neko' },
          { name: '2次元画像(R18)', value: 'hentai' },
        ],
      },
    ],
  },

  async execute(interaction) {
    if (!interaction.channel.nsfw) {
      // NSFWチャンネルでの実行でない場合はエラーを返す
      return interaction.reply('このコマンドはNSFWチャンネルでのみ実行できます。');
    }

    const imageType = interaction.options.getString('type');
    const apiUrl = `https://nekobot.xyz/api/image?type=${encodeURIComponent(imageType)}`;

    try {
      const response = await axios.get(apiUrl);

      const embed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle(imageType === 'pgif' ? '一般の画像(R18)' : imageType === 'hentai' ? '2次元画像(R18)' : 'Neko画像')
        .setImage(response.data.message);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('画像の取得中にエラーが発生しました。');
    }
  },
};
