const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverlist')
    .setDescription('Miku#0395が参加しているサーバーリストを表示します。'),

  async execute(interaction) {
    // ADMIN_USER_IDに登録されていないユーザーからの実行は拒否する
    const adminUserId = process.env.ADMIN_USER_ID;
    if (interaction.user.id !== adminUserId) {
      try {
        await interaction.reply({ content: 'このコマンドを実行する権限がありません。', ephemeral: true });
      } catch (error) {
        if (error.message !== 'INTERACTION_ALREADY_REPLIED') {
          console.error('Failed to reply:', error);
        }
      }
      return;
    }

    // コマンドの実行を一時的に遅延する
    await interaction.deferReply({ ephemeral: true });

    const embed = new MessageEmbed()
      .setTitle('Server List')
      .setColor('#00ff00');

    // クライアントが参加している全てのサーバーリストを取得
    const guilds = interaction.client.guilds.cache;

    for (const guild of guilds.values()) {
      let inviteLink = '招待リンクがありません';

      try {
        const invites = await guild.invites.fetch();
        const invite = invites.first();
        if (invite) {
          inviteLink = `https://discord.gg/${invite.code}`;
        }
      } catch (error) {
        if (error.code === 50013) { // Missing Permissions
          console.log(`Missing permissions to fetch invites for guild: ${guild.name} (${guild.id})`);
        } else {
          console.error(`Failed to fetch invites for guild: ${guild.name} (${guild.id})`, error);
        }
      }

      if (inviteLink === '招待リンクがありません') {
        embed.addField(guild.name, `ID: ${guild.id}\nMembers: ${guild.memberCount}`);
      } else {
        embed.addField(guild.name, `Members: ${guild.memberCount}\nInvite: [招待リンク](${inviteLink})`);
      }
    }

    try {
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      if (error.message !== 'INTERACTION_ALREADY_REPLIED') {
        console.error('Failed to edit reply:', error);
      }
    }
  },
};
