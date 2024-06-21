const { Permissions } = require('discord.js');

module.exports = {
  data: {
    name: 'timeout',
    description: 'ユーザーをタイムアウトします。',
    options: [
      {
        name: 'user',
        type: 'USER',
        description: 'タイムアウトするユーザーを選択してください。',
        required: true,
      },
      {
        name: 'duration',
        type: 'INTEGER',
        description: 'タイムアウトの期間（分）を指定してください。',
        required: true,
      },
      {
        name: 'reason',
        type: 'STRING',
        description: 'タイムアウトの理由を入力してください。',
        required: false,
      },
    ],
    defaultPermission: false,
  },
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'タイムアウトの理由は指定されていません。';

    if (!user) {
      await interaction.reply('タイムアウトするユーザーを正しく指定してください。');
      return;
    }

    const executorPermissions = interaction.member.permissions;
    const botPermissions = interaction.guild.me.permissions;

    if (!botPermissions.has(Permissions.FLAGS.MODERATE_MEMBERS) || !executorPermissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) {
      await interaction.reply('BOTまたは実行者のパーミッションが不足しているため、タイムアウトできません。');
      return;
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      await interaction.reply('指定されたユーザーがこのサーバーに存在しません。');
      return;
    }

    const timeoutDuration = duration * 60 * 1000; // 分をミリ秒に変換

    try {
      await member.timeout(timeoutDuration, reason);
      await interaction.reply(`${user.tag} を ${duration} 分間タイムアウトしました。理由: ${reason}`);
    } catch (error) {
      console.error('タイムアウト中にエラーが発生しました:', error);
      await interaction.reply('タイムアウト中にエラーが発生しました。');
    }
  },
};
