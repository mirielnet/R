const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setnick')
    .setDescription('指定したメンバーのニックネームを変更します。')
    .addUserOption(option =>
      option
        .setName('member')
        .setDescription('ニックネームを変更するメンバーを選択してください。')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('nickname')
        .setDescription('新しいニックネームを入力してください。空白にすると元の名前に戻ります。')
    ),

  async execute(interaction) {
    const member = interaction.options.getMember('member');
    let nickname = interaction.options.getString('nickname');

    // ニックネームを変更できる権限があるか確認
    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) {
      await interaction.reply({ content: 'ニックネームを変更する権限がありません。', ephemeral: true });
      return;
    }

    try {
      // nicknameが空白の場合は元の名前に戻す
      if (!nickname) {
        nickname = member.user.username;
      }

      // ニックネームを変更
      await member.setNickname(nickname);
      await interaction.reply({ content: `${member.displayName}のニックネームを${nickname}に変更しました。` });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'ニックネームの変更中にエラーが発生しました。', ephemeral: true });
    }
  },
};
