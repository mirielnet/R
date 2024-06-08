const { SlashCommandBuilder } = require('@discordjs/builders');

// ここに特定のユーザーのIDを設定します
const YOUR_USER_ID = '1139799916420534282';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('messaged')
    .setDescription('指定したメッセージを削除します。')
    .addStringOption(option =>
      option.setName('message_id')
        .setDescription('削除するメッセージのID')
        .setRequired(true)),

  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');

    // 特定のユーザーのみが実行できるように制限
    if (interaction.user.id !== YOUR_USER_ID) {
      return interaction.reply('このコマンドは特定のユーザーのみが実行できます。');
    }

    try {
      const deletedMessage = await interaction.channel.messages.fetch(messageId);
      await deletedMessage.delete();
      await interaction.reply(`メッセージ(ID: ${messageId})を削除しました。`);
    } catch (error) {
      console.error(error);
      await interaction.reply('指定したメッセージを削除できませんでした。メッセージIDが正しいか、Botに削除権限があるか確認してください。');
    }
  },
};
