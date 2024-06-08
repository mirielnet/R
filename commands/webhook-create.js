const { SlashCommandBuilder } = require('@discordjs/builders');
const { WebhookClient } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('webhook-create')
    .setDescription('指定された名前でWebHookを作成し、作成したWebHookのURLを返します。')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('作成するWebHookの名前を指定してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const name = interaction.options.getString('name');

    try {
      // Webhookを作成
      const webhook = await interaction.channel.createWebhook(name, {
        avatar: interaction.user.displayAvatarURL(),
      });

      await interaction.followUp({ content: `WebHookが作成されました！\nWebHookのURL: ${webhook.url}`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.followUp({ content: 'WebHookの作成中にエラーが発生しました。', ephemeral: true });
    }
  },
};
