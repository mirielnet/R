const { SlashCommandBuilder } = require('@discordjs/builders');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('email-send')
    .setDescription('指定されたメールアドレスにメールを送信します。')
    .addStringOption(option =>
      option
        .setName('email')
        .setDescription('送信先のメールアドレスを入力してください。')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('subject')
        .setDescription('メールの件名を入力してください。')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('content')
        .setDescription('メールの内容を入力してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    // 最初にインタラクションを延期
    await interaction.deferReply();

    const email = interaction.options.getString('email');
    const subject = interaction.options.getString('subject');
    const content = interaction.options.getString('content');
    const senderTag = interaction.user.tag; // 送信者のタグ

    // ここにSMTPの設定を記述します
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // メールの内容に追加するフッター
    const poweredBy = "Powered By resphere.net";

    // メールの設定
    const mailOptions = {
      from: process.env.SENDER_EMAIL, // 送信元のメールアドレス
      to: email, // 送信先のメールアドレス
      subject: subject, // メールの件名
      text: `${content}\n\nこのMailは ${senderTag} から送信されております。\n${poweredBy}`, // メールの本文 + フッター
    };

    // 一度だけ返信するフラグ
    let replied = false;

    // .envが存在しない場合は、この機能を利用できません。
    if (!dotenv.config()) {
      interaction.reply({
        content: 'この機能は現在ご利用できません。.envファイルを作成してください。',
        ephemeral: true,
      });
      return;
    }

    // 必要な環境変数が存在しない場合は、この機能を利用できません。
    if (!process.env.SMTP_HOST || !process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD || !process.env.SENDER_EMAIL) {
      interaction.reply({
        content: 'この機能は現在ご利用できません。.envファイルに必要な環境変数を設定してください。',
        ephemeral: true,
      });
      return;
    }

    // メールを送信
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        if (!replied) {
          interaction.editReply({ content: 'メールの送信中にエラーが発生しました。', ephemeral: true });
          replied = true;
        }
      } else {
        console.log('Email sent: ' + info.response);
        if (!replied) {
          interaction.editReply({ content: 'メールを送信しました。', ephemeral: true });
          replied = true;
        }
      }
    });
  },
};
