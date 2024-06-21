const { SlashCommandBuilder } = require('@discordjs/builders');
const qrcode = require('qrcode');
const bwipjs = require('bwip-js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('generate-code')
    .setDescription('指定されたURLまたは文字列からQRコードやバーコードを生成し、添付します。')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('生成するコードの種類 (qr, microqr, rmqr, jan)')
        .setRequired(true)
        .addChoices(
          { name: 'QRコード', value: 'qr' },
          { name: 'マイクロQRコード', value: 'microqr' },
          { name: 'JANコード', value: 'jan' }
        )
    )
    .addStringOption(option =>
      option
        .setName('data')
        .setDescription('生成するコードのデータ (URLや文字列)')
        .setRequired(true)
    ),
  async execute(interaction) {
    const type = interaction.options.getString('type');
    const data = interaction.options.getString('data');

    try {
      let codeImage;
      switch (type) {
        case 'qr':
          codeImage = await qrcode.toBuffer(data);
          break;
        case 'microqr':
          try {
            codeImage = await qrcode.toBuffer(data, { version: 1, errorCorrectionLevel: 'L' });
          } catch (err) {
            if (err.message.includes('version')) {
              const version = parseInt(err.message.split('Minimum version required to store current data is: ')[1], 10);
              codeImage = await qrcode.toBuffer(data, { version, errorCorrectionLevel: 'L' });
            } else {
              throw err;
            }
          }
          break;
        case 'jan':
          codeImage = await bwipjs.toBuffer({
            bcid: 'ean13', // Barcode type
            text: data,    // Text to encode
            scale: 3,      // 3x scaling factor
            height: 10,    // Bar height, in millimeters
            includetext: true, // Show human-readable text
            textxalign: 'center', // Always good to set this
          });
          break;
        default:
          throw new Error('Unsupported code type');
      }

      // 生成元のデータをメッセージとして表示し、コード画像を添付
      await interaction.reply({ content: data, files: [{ attachment: codeImage, name: `${type}.png` }] });
    } catch (error) {
      console.error('Failed to generate code:', error);
      await interaction.reply('コードの生成に失敗しました。');
    }
  },
};
