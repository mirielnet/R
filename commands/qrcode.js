const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const qrcode = require('qrcode');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('generate-qrcode')
    .setDescription('指定されたURLからQRコードを生成し、添付します。')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('QRコードを生成するURL')
        .setRequired(true)
    ),
  async execute(interaction) {
    const url = interaction.options.getString('url');

    try {
      const qrCodeImage = await qrcode.toBuffer(url); // QRコードをバッファとして生成

      // 生成元のURLをメッセージとして表示し、QRコードを添付
      await interaction.reply({ content: url, files: [{ attachment: qrCodeImage, name: 'qrcode.png' }] });
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      await interaction.reply('QRコードの生成に失敗しました。');
    }
  },
};
