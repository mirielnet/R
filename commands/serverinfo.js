const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('サーバーの情報を表示します。'),

  async execute(interaction) {
    const guild = interaction.guild;

    if (!guild) {
      return interaction.reply('このコマンドはサーバー内で使用してください。');
    }

    const guildName = guild.name || '不明';
    const guildId = guild.id || '不明';
    const guildRegion = guild.region || '不明';
    const guildCreatedAt = guild.createdAt ? guild.createdAt.toLocaleString('ja-JP') : '不明';

    const memberCount = guild.memberCount || '不明';
    const botCount = guild.members.cache.filter(member => member.user.bot).size || '不明';

    const textChannels = guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT').size || '不明';
    const voiceChannels = guild.channels.cache.filter(channel => channel.type === 'GUILD_VOICE').size || '不明';

    const emojis = guild.emojis.cache;
    const emojiCount = emojis.size;

    const iconURL = guild.iconURL();

    const owner = await guild.fetchOwner();
    let ownerTag = owner ? `${owner.user.tag}` : '不明';

    if (ownerTag.endsWith('#0000')) {
      ownerTag = ownerTag.slice(0, -5); // タグの末尾の5文字を削除
    } else if (ownerTag.endsWith('#0')) {
      ownerTag = ownerTag.slice(0, -2); // タグの末尾の2文字を削除
    }

    const defaultChannel = guild.systemChannel || 'なし';

    const embed = new MessageEmbed()
      .setTitle('サーバー情報')
      .setDescription(`**サーバー名:**\n${guildName}\n\n**サーバーID:**\n${guildId}`)
      .addFields(
        { name: 'オーナー', value: ownerTag, inline: true },
        { name: '地域', value: guildRegion, inline: true },
        { name: '作成日時', value: guildCreatedAt, inline: true },
        { name: 'メンバー数', value: memberCount.toString(), inline: true },
        { name: 'ボット数', value: botCount.toString(), inline: true },
        { name: 'テキストチャンネル数', value: textChannels.toString(), inline: true },
        { name: 'ボイスチャンネル数', value: voiceChannels.toString(), inline: true },
        { name: '絵文字数', value: emojiCount.toString(), inline: false }
      )
      .setColor('#0099ff');

    if (iconURL) {
      embed.setThumbnail(iconURL);
    }

    // 絵文字の表示と数の取得
    let emojiList = '';
    let animatedEmojiCount = 0;
    emojis.forEach(emoji => {
      if (emoji.animated) {
        if (emojiList.length + emoji.toString().length <= 1024) {
          emojiList += `${emoji} `;
          animatedEmojiCount++;
        }
      } else {
        if (emojiList.length + emoji.toString().length <= 1024) {
          emojiList += `${emoji} `;
        }
      }
    });

    embed.addField('絵文字', emojiList || 'なし');
    embed.addField('アニメーション絵文字数', animatedEmojiCount.toString(), true);

    await interaction.reply({ embeds: [embed] });
  },
};
