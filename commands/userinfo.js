const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('指定したユーザーの情報を取得します。')
    .addUserOption(option => option.setName('user').setDescription('ユーザーを指定してください。')),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user') || interaction.user;

      // 追加: プロフィールURL (仮のURLを記載)
      const profileURL = `https://discord.com/users/${user.id}`;

      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${user.tag} の情報`)
        .setURL(profileURL)  // プロフィールURLを埋め込み
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 2048 }))
        .addField('ユーザータグ', user.tag)
        .addField('ID', user.id)
        .addField('アカウント作成日', user.createdAt.toUTCString());

      if (user.bot) {
        embed.addField('ボット', 'はい');
      } else {
        embed.addField('ボット', 'いいえ');
      }

      if (user.flags) {
        const flagsArray = user.flags.toArray();
        if (flagsArray.length > 0) {
          const flagsString = flagsArray.join(', ');
          embed.addField('バッジ', flagsString);
        }
      } else {
        embed.addField('バッジ', 'なし');
      }

      const member = interaction.guild?.members.cache.get(user.id);
      if (member) {
        const joinedAt = member.joinedAt;
        const roles = member.roles.cache.filter(role => role.id !== interaction.guild.roles.everyone.id).map(role => role.name);

        embed.addField('サーバー参加日', joinedAt.toUTCString());
        embed.addField('ロール', roles.join('\n') || 'なし');
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('コマンドの実行中にエラーが発生しました。');
    }
  },
};
