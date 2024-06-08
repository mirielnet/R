const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const fs = require('fs');

// 震度を取得する関数
function getIntensity(scale) {
  if (scale >= 10 && scale < 20) return '1';
  if (scale >= 20 && scale < 30) return '2';
  if (scale >= 30 && scale < 40) return '3';
  if (scale >= 40 && scale < 45) return '4';
  if (scale >= 45 && scale < 50) return '5弱';
  if (scale >= 50 && scale < 55) return '5強';
  if (scale >= 55 && scale < 60) return '6弱';
  if (scale >= 60 && scale < 70) return '6強';
  if (scale >= 70) return '7';
  return '不明';
}

async function captureMapScreenshot(mapUrl) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // 地図のURLにアクセス
  await page.goto(mapUrl);

  // 地図が読み込まれるまで待機
  await page.waitForSelector('#map');

  // 地図のスクリーンショットを取得
  const screenshotBuffer = await page.screenshot();

  // スクリーンショットをファイルに保存
  fs.writeFileSync('./screenshot.png', screenshotBuffer);

  // ブラウザを閉じる
  await browser.close();

  return './screenshot.png';  // 保存先のパスを返す
}

async function getEarthquakeInfo(interaction) {
  try {
    // すぐに応答を返す
    await interaction.deferReply({ ephemeral: true });

    const response = await fetch('https://api.p2pquake.net/v2/history?codes=551&limit=1');
    const data = await response.json();

    // 地震情報を処理する
    const earthquake = data[0]?.earthquake;
    if (!earthquake) {
      throw new Error('地震情報が見つかりませんでした。');
    }
    const magnitude = earthquake.hypocenter?.magnitude ?? '不明';
    const intensity = getIntensity(earthquake.maxScale);
    const depth = earthquake.hypocenter?.depth ?? '不明';
    const location = earthquake.hypocenter?.name ?? '不明';

    // 地図のURLを生成
    const mapUrl = `https://www.openstreetmap.org/?mlat=${earthquake.hypocenter?.latitude}&mlon=${earthquake.hypocenter?.longitude}#map=10/${earthquake.hypocenter?.latitude}/${earthquake.hypocenter?.longitude}`;

    // 地図のスクリーンショットを取得し、ファイルに保存
    const screenshotPath = await captureMapScreenshot(mapUrl);

    // Embedを作成
    const embed = new MessageEmbed()
      .setTitle('最新の地震情報')
      .addField('マグニチュード', `${magnitude}`, true)
      .addField('震度', `${intensity}`, true)
      .addField('震源地', `${location}`, true)
      .addField('深さ', `${depth} km`, true)
      .setDescription(`[震源地の地図を表示する](${mapUrl})`)
      .setColor('#ff0000')
      .setImage(`attachment://${screenshotPath}`);  // 保存したスクリーンショットを指定

    // チャンネルにEmbedを送信
    await interaction.editReply({ embeds: [embed], files: [screenshotPath] });
  } catch (error) {
    console.error(error);
    await interaction.followUp('地震情報を取得できませんでした。');
  }
}

module.exports = {
  data: {
    name: 'earthquake',
    description: '最新の地震情報を表示します。',
  },
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'earthquake') {
      await getEarthquakeInfo(interaction);
    }
  },
};
