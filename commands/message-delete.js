const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('message-delete')
    .setDescription('送信されたチャンネルのメッセージを一斉削除します。'),

  async execute(interaction) {
    // Admin権限を持っているか確認
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply('このコマンドを実行する権限がありません。');
    }

    // メッセージを一斉削除
    try {
      const channel = interaction.channel;
      const fetchedMessages = await channel.messages.fetch();
      await channel.bulkDelete(fetchedMessages);
      await interaction.reply('メッセージを一斉削除しました。');
    } catch (error) {
      console.error(error);
      await interaction.reply('メッセージの削除中にエラーが発生しました。');
    }
  },
};
