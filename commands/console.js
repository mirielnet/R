const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');
const iconv = require('iconv-lite');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('console')
    .setDescription('コンソールコマンドを実行して結果を表示します。')
    .addStringOption(option =>
      option
        .setName('command')
        .setDescription('実行するコマンドを入力してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    const allowedUser = process.env.ADMIN_USER_ID;

    if (interaction.user.id !== allowedUser) {
      await interaction.reply({ content: 'このコマンドは許可されていません。', ephemeral: true });
      return;
    }

    const command = interaction.options.getString('command');

    try {
      // 即座に返信
      await interaction.reply({ content: 'コマンド実行中...', ephemeral: true });

      // コマンドの実行
      const { stdout, stderr } = await exec(command, { encoding: 'buffer' });

      if (stderr) {
        console.error(stderr);
        await interaction.editReply({ content: 'コマンドの実行中にエラーが発生しました。', ephemeral: true });
      } else {
        const result = process.platform === 'win32' ? iconv.decode(stdout, 'Shift_JIS') : stdout;
        await interaction.editReply({ content: `\`\`\`\n${result}\n\`\`\``, ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: 'コマンドの実行中にエラーが発生しました。', ephemeral: true });
    }
  },
};
