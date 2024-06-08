const fetch = require('node-fetch');

async function createShortURL(url) {
  try {
    const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
    const data = await response.json();
    if (data && data.shorturl) {
      return data.shorturl;
    } else {
      throw new Error('Failed to create short URL.');
    }
  } catch (error) {
    console.error('An error occurred while creating short URL:', error);
    throw error;
  }
}

module.exports = {
  data: {
    name: 'shorturl',
    description: '指定したURLを短縮します。',
    options: [
      {
        name: 'url',
        type: 'STRING',
        description: '短縮したいURLを指定してください。',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const url = interaction.options.getString('url');

    try {
      const shortURL = await createShortURL(url);
      await interaction.reply(`元のURL: ${url}\n短縮URL: ${shortURL}`);
    } catch (error) {
      console.error(error);
      await interaction.reply('短縮URLの作成中にエラーが発生しました。');
    }
  },
};
