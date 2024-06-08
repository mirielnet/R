const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

function getPermissionName(permission) {
  switch (permission) {
    case 'CREATE_INSTANT_INVITE':
      return '招待リンクの作成';
    case 'KICK_MEMBERS':
      return 'メンバーのキック';
    case 'BAN_MEMBERS':
      return 'メンバーのBAN';
    case 'ADMINISTRATOR':
      return '管理者権限';
    case 'MANAGE_CHANNELS':
      return 'チャンネルの管理';
    case 'MANAGE_GUILD':
      return 'サーバーの管理';
    case 'ADD_REACTIONS':
      return 'リアクションの追加';
    case 'VIEW_AUDIT_LOG':
      return '監査ログの閲覧';
    case 'PRIORITY_SPEAKER':
      return '優先スピーカー';
    case 'STREAM':
      return 'ビデオの配信';
    case 'VIEW_CHANNEL':
      return 'チャンネルの閲覧';
    case 'SEND_MESSAGES':
      return 'メッセージの送信';
    case 'SEND_TTS_MESSAGES':
      return 'TTSメッセージの送信';
    case 'MANAGE_MESSAGES':
      return 'メッセージの管理';
    case 'EMBED_LINKS':
      return '埋め込みリンク';
    case 'ATTACH_FILES':
      return 'ファイルの添付';
    case 'READ_MESSAGE_HISTORY':
      return 'メッセージ履歴の閲覧';
    case 'MENTION_EVERYONE':
      return '全員メンション';
    case 'USE_EXTERNAL_EMOJIS':
      return '外部絵文字の使用';
    case 'VIEW_GUILD_INSIGHTS':
      return 'サーバーインサイトの閲覧';
    case 'CONNECT':
      return 'ボイスチャンネルへの接続';
    case 'SPEAK':
      return 'ボイスチャンネルでの発言';
    case 'MUTE_MEMBERS':
      return 'メンバーのミュート';
    case 'DEAFEN_MEMBERS':
      return 'メンバーのスピーカーミュート';
    case 'MOVE_MEMBERS':
      return 'メンバーの移動';
    case 'USE_VAD':
      return '音声検出の使用';
    case 'CHANGE_NICKNAME':
      return 'ニックネームの変更';
    case 'MANAGE_NICKNAMES':
      return 'ニックネームの管理';
    case 'MANAGE_ROLES':
      return 'ロールの管理';
    case 'MANAGE_WEBHOOKS':
      return 'Webhookの管理';
    case 'MANAGE_EMOJIS_AND_STICKERS':
      return '絵文字とスタンプの管理';
    case 'USE_APPLICATION_COMMANDS':
      return 'アプリケーションコマンドの使用';
    case 'REQUEST_TO_SPEAK':
      return 'スピーカー申請';
    case 'MANAGE_THREADS':
      return 'スレッドの管理';
    case 'USE_PUBLIC_THREADS':
      return 'パブリックスレッドの使用';
    case 'USE_PRIVATE_THREADS':
      return 'プライベートスレッドの使用';
    case 'USE_EXTERNAL_STICKERS':
      return '外部スタンプの使用';
    case 'MODERATE_MEMBERS':
      return 'メンバーのモデレート';
    default:
      return permission;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('指定したロールの情報を取得します。')
    .addRoleOption(option => option.setName('role').setDescription('ロールを指定してください。').setRequired(true)),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    if (!role) {
      return interaction.reply('ロールを指定してください。');
    }

    const rolePermissions = role.permissions.toArray().map(permission => getPermissionName(permission));
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`ロール情報: ${role.name}`)
      .addField('ロールID', role.id, true)
      .addField('ロールの色', role.hexColor, true)
      .addField('メンション可能か', role.mentionable ? '可能' : '不可能', true)
      .addField('権限', rolePermissions.join('\n'));

    await interaction.reply({ embeds: [embed] });
  },
};
