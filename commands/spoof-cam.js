const { SlashCommandBuilder } = require('@discordjs/builders');
const { WebhookClient, MessageEmbed } = require('discord.js');

// 1つのWebhookを保持する変数
let webhook;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spoof')
    .setDescription('指定したユーザーまんまのWebHookを作成し、言わせたい言葉を送信します。')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('なりすまししたいユーザーを指定してください。')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription('言わせたい言葉を入力してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('user');
    const messageContent = interaction.options.getString('message');

    try {
      // Webhookが未作成の場合は新しく作成する
      if (!webhook) {
        const createdWebhook = await interaction.channel.createWebhook(targetUser.username, { avatar: targetUser.avatarURL() });
        webhook = new WebhookClient({ id: createdWebhook.id, token: createdWebhook.token });
      } else {
        // 2回目以降はWebhookの名前とアバターを指定したユーザーに変更する
        await webhook.edit({ name: targetUser.username, avatar: targetUser.avatarURL() });
      }

      // Webhookを使用して言わせたい言葉を送信
      await webhook.send(messageContent);

      await interaction.editReply({ content: `${targetUser.username} のなりすましWebHookを作成し、指定した言葉を送信しました。`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: 'WebHookの作成やメッセージの送信中にエラーが発生しました。', ephemeral: true });
    }
  },
};
