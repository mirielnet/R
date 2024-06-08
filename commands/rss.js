const Parser = require('rss-parser');

async function getRSS(url) {
  try {
    const parser = new Parser();
    const feed = await parser.parseURL(url);
  
    // メッセージの作成
    let message = '';
    feed.items.forEach(item => {
      message += `**Title**: ${item.title}\n`;
      message += `**Link**: ${item.link}\n`;
      message += `**Description**: ${item.description}\n`;
      message += `**Published Date**: ${item.pubDate}\n`;
      message += '-----------------------------\n';
    });
  
    return message;
  } catch (error) {
    console.error('RSSの取得中にエラーが発生しました:', error);
    throw error;
  }
}

module.exports = {
  data: {
    name: 'rss',
    description: '指定したURLのRSSを表示します。',
    options: [
      {
        name: 'url',
        type: 'STRING',
        description: 'RSSのURLを指定してください。',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'rss') {
      const url = interaction.options.getString('url');
      if (!url) {
        await interaction.reply('RSSのURLを正しく指定してください。');
        return;
      }

      try {
        const rssMessage = await getRSS(url);
        await interaction.reply(rssMessage);
      } catch (error) {
        console.error(error);
        await interaction.reply('RSSの取得中にエラーが発生しました。');
      }
    }
  },
};
