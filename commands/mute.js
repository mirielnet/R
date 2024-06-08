const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('ユーザーをミュートします。')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('ミュートするユーザーを選択してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getMember('user'); // getMemberに変更
    const guild = interaction.guild;
    const mutedRoleName = 'Muted'; // Mutedロールの名前

    if (!guild.me.permissions.has('MANAGE_ROLES')) {
      return interaction.reply({ content: 'このコマンドを実行するための権限がありません。', ephemeral: true });
    }

    // Mutedロールがない場合は作成
    let mutedRole = guild.roles.cache.find(role => role.name === mutedRoleName);
    if (!mutedRole) {
      try {
        mutedRole = await guild.roles.create({
          name: mutedRoleName,
          color: '#808080', // グレー色など、任意の色を指定
          permissions: [], // すべての権限を無効化
        });

        // Mutedロールを作成したことを通知するなどの処理を追加できます
      } catch (error) {
        console.error('Mutedロールの作成中にエラーが発生しました。', error);
        return interaction.reply({ content: 'Mutedロールの作成中にエラーが発生しました。', ephemeral: true });
      }
    }

    // ユーザーの既存のロールを全て削除
    try {
      await user.roles.set([]);
      // Mutedロールを追加
      await user.roles.add(mutedRole);
      interaction.reply({ content: `${user.user.tag} をミュートしました。`, ephemeral: true });
    } catch (error) {
      console.error('ロールの削除中にエラーが発生しました。', error);
      interaction.reply({ content: 'ミュート中にエラーが発生しました。', ephemeral: true });
    }
  },
};
