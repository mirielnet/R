const { SlashCommandBuilder } = require('@discordjs/builders');
const puppeteer = require('puppeteer');

// ブロックするURLのリスト
const blockedUrls = [
  'https://ipinfo.io/*',
  'https://www.cman.jp/network/support/go_access.cgi',
  'https://google.com/',
  'https://google.co.jp/',
  'https://env.b4iine.net/',
  'https://www.ugtop.com/',
  'https://www.ugtop.com/spill.shtml',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('screenshot')
    .setDescription('指定されたURLのスクリーンショットを取得します。')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('スクリーンショットを取得したいURLを指定してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const url = interaction.options.getString('url');

    // ブロックされたURLのリストに含まれているかをチェック
    if (blockedUrls.some(blockedUrl => url.startsWith(blockedUrl))) {
      await interaction.followUp('申し訳ありませんが、このURLへのアクセスは制限されています。');
      return;
    }

    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);
      const screenshot = await page.screenshot();
      await browser.close();

      await interaction.followUp({ files: [{ attachment: screenshot, name: 'screenshot.png' }] });
    } catch (error) {
      console.error(error);
      await interaction.followUp('スクリーンショットの取得中にエラーが発生しました。');
    }
  },
};
