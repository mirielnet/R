const { SlashCommandBuilder } = require('@discordjs/builders');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spam')
    .setDescription('指定した言葉を連投します。')
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('連投したい言葉を入力してください。')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('times')
        .setDescription('連投回数を指定してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    const adminUserId = process.env.ADMIN_USER_ID;
    if (interaction.user.id !== adminUserId) {
      return interaction.reply({ content: 'このコマンドは実行できません。', ephemeral: true });
    }

    const messageContent = interaction.options.getString('message');
    const times = interaction.options.getInteger('times');

    if (times <= 0 || times > 50) {
      return interaction.reply({ content: '連投回数は1から50までの間で指定してください。', ephemeral: true });
    }

    try {
      interaction.deferReply({ ephemeral: true });

      for (let i = 0; i < times; i++) {
        await interaction.channel.send(messageContent);
      }

      await interaction.editReply({ content: `「${messageContent}」を${times}回連投しました。`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: '連投中にエラーが発生しました。', ephemeral: true });
    }
  },
};
