const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');
const iconv = require('iconv-lite');
const { promisify } = require('util');
const execPromise = promisify(exec);

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
      await interaction.reply({ content: 'コマンド実行中...', ephemeral: true });

      const child = exec(command, { encoding: 'buffer' });

      let output = '';

      child.stdout.on('data', (data) => {
        const result = process.platform === 'win32' ? iconv.decode(data, 'Shift_JIS') : data.toString();
        output += result;

        interaction.editReply({ content: `\`\`\`\n${output}\n\`\`\``, ephemeral: true }).catch(console.error);
      });

      child.stderr.on('data', (data) => {
        const result = process.platform === 'win32' ? iconv.decode(data, 'Shift_JIS') : data.toString();
        output += result;

        interaction.editReply({ content: `\`\`\`\n${output}\n\`\`\``, ephemeral: true }).catch(console.error);
      });

      child.on('close', (code) => {
        interaction.editReply({ content: `コマンドが終了しました。終了コード: ${code}\n\`\`\`\n${output}\n\`\`\``, ephemeral: true }).catch(console.error);
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: 'コマンドの実行中にエラーが発生しました。', ephemeral: true });
    }
  },
};
