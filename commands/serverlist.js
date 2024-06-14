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
    embed.setDescription(`Total Servers: ${guilds.size}`);

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

      const owner = await guild.fetchOwner();
      let ownerTag = owner.user.tag;
      if (ownerTag.endsWith('#0000') || ownerTag.endsWith('#0')) {
        ownerTag = ownerTag.split('#')[0];
      }

      embed.addField(
        guild.name,
        `ID: ${guild.id}\nMembers: ${guild.memberCount}\nOwner: ${ownerTag}\nInvite: ${inviteLink === '招待リンクがありません' ? inviteLink : `[招待リンク](${inviteLink})`}`
      );
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
