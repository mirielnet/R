const { Permissions } = require('discord.js');

module.exports = {
  data: {
    name: 'ban',
    description: 'ユーザーをBANします。',
    options: [
      {
        name: 'user',
        type: 'USER',
        description: 'BANするユーザーを選択してください。',
        required: true,
      },
      {
        name: 'reason',
        type: 'STRING',
        description: 'BANの理由を入力してください。',
        required: false,
      },
    ],
    defaultPermission: false,
  },
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'BANの理由は指定されていません。';

    if (!user) {
      await interaction.reply('BANするユーザーを正しく指定してください。');
      return;
    }

    const executorPermissions = interaction.member.permissions;
    const botPermissions = interaction.guild.me.permissions;

    if (!botPermissions.has(Permissions.FLAGS.BAN_MEMBERS) || !executorPermissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
      await interaction.reply('BOTまたは実行者のパーミッションが不足しているため、BANできません。');
      return;
    }

    try {
      await interaction.guild.members.ban(user, { reason });
      await interaction.reply(`${user.tag} をBANしました。理由: ${reason}`);
    } catch (error) {
      console.error('BAN中にエラーが発生しました:', error);
      await interaction.reply('BAN中にエラーが発生しました。');
    }
  },
};
