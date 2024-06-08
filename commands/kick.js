module.exports = {
  data: {
    name: 'kick',
    description: 'ユーザーをキックします。',
    options: [
      {
        name: 'user',
        type: 'USER',
        description: 'キックするユーザーを選択してください。',
        required: true,
      },
      {
        name: 'reason',
        type: 'STRING',
        description: 'キックの理由を入力してください。',
        required: false,
      },
    ],
  },
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'キックの理由は指定されていません。';

    if (!user) {
      await interaction.reply('キックするユーザーを正しく指定してください。');
      return;
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      await interaction.reply('指定されたユーザーが見つかりません。');
      return;
    }

    if (!member.kickable) {
      await interaction.reply('このユーザーはキックできません。');
      return;
    }

    try {
      await member.kick(reason);
      await interaction.reply(`${user.tag} をキックしました。理由: ${reason}`);
    } catch (error) {
      console.error('キック中にエラーが発生しました:', error);
      await interaction.reply('キック中にエラーが発生しました。');
    }
  },
};
