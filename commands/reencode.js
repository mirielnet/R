module.exports = {
  data: {
    name: 'reencode',
    description: 'テキストを文字化けさせます。',
    options: [
      {
        name: 'text',
        description: '文字化けさせるテキストを入力してください。',
        type: 'STRING',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const { options } = interaction;
    const text = options.getString('text');

    const originalText = text;
    const encodedText = encodeText(text);

    await interaction.reply({
      content: `入力前のテキスト: ${originalText}\n入力後のテキスト: ${encodedText}`,
    });
  },
};

function encodeText(text) {
  // 文字列を文字化けさせる処理を実装する
  // ここでは例として各文字のUnicodeコードポイントを反転させる方法を使用しています
  const encodedChars = [...text]
    .map((char) => String.fromCodePoint(0x10ffff - char.codePointAt(0)))
    .join('');

  return encodedChars;
}
