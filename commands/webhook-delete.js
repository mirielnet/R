const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('webhook-delete')
    .setDescription('M.が生成したWebHookをすべて削除します。'),

  async execute(interaction) {
    try {
      const webhooks = await interaction.guild.fetchWebhooks();

      // Alice_BOTが生成したWebhookのみフィルタリング
      const aliceWebhooks = webhooks.filter((webhook) => webhook.owner.id === interaction.client.user.id);

      if (aliceWebhooks.size === 0) {
        await interaction.reply('M.が生成したWebHookは見つかりませんでした。');
        return;
      }

      // Webhookを削除
      aliceWebhooks.forEach(async (webhook) => {
        await webhook.delete();
      });

      await interaction.reply('M.が生成したWebHookをすべて削除しました。');
    } catch (error) {
      console.error(error);
      await interaction.reply('WebHookの削除中にエラーが発生しました。');
    }
  },
};
