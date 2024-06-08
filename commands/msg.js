const { SlashCommandBuilder } = require('@discordjs/builders');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const { MessageAttachment } = require('discord.js');

// メイリオフォントを登録
registerFont('./meiryo.ttc', { family: 'Meiryo' });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('msg')
    .setDescription('メッセージを名言風にします。')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('メッセージのIDを入力してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    const messageId = interaction.options.getString('message');
    const message = await interaction.channel.messages.fetch(messageId);

    // Canvasを準備
    const canvas = createCanvas(800, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000'; // 背景を黒に設定
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 送信者のアイコンを描画
    const userAvatarURL = message.author.avatarURL({ format: 'png', size: 128 });
    const avatar = await loadImage(userAvatarURL);
    ctx.drawImage(avatar, 20, 20, 128, 128);

    // メッセージ本文を描画
    ctx.font = 'bold 24px Meiryo';
    ctx.fillStyle = '#ffffff'; // 白で文字を描画
    const lines = message.content.match(/.{1,30}/g); // メッセージを30文字ごとに分割
    const textHeight = lines.length * 30;
    const textY = (canvas.height - textHeight) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, 200, textY + index * 30);
    });

    // 送信者のタグを描画
    ctx.font = '18px Meiryo';
    ctx.fillStyle = '#ffffff';
    const senderTag = message.author.tag;
    const senderTagWidth = ctx.measureText(senderTag).width;
    ctx.fillText(senderTag, (canvas.width - senderTagWidth) / 2, canvas.height - 20);

    // BOTのタグを描画
    const botTag = 'M.#6866';
    const botTagWidth = ctx.measureText(botTag).width;
    ctx.fillText(botTag, canvas.width - botTagWidth - 20, canvas.height - 20);

    // 画像をファイルとして保存
    const outputFilePath = `quote_${messageId}.png`;
    const out = fs.createWriteStream(outputFilePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', async () => {
      const imageAttachment = new MessageAttachment(outputFilePath, 'quote.png');
      await interaction.reply({ content: `メッセージの名言風画像を生成しました！`, files: [imageAttachment] });
      fs.unlinkSync(outputFilePath);
    });
  },
};
