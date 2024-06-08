const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus, entersState } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('指定されたYouTubeの動画を再生します。')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('再生するYouTubeの動画URL')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // defer the reply

    const url = interaction.options.getString('url');
    if (!ytdl.validateURL(url)) return interaction.followUp(`${url} は処理できません。`);

    const channel = interaction.member.voice.channel;
    if (!channel) return interaction.followUp('先にボイスチャンネルに参加してください！');

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    const stream = ytdl(ytdl.getURLVideoID(url), {
      filter: format => format.audioCodec === 'opus' && format.container === 'webm',
      quality: 'highest',
      highWaterMark: 32 * 1024 * 1024,
    });

    const resource = createAudioResource(stream, { inputType: StreamType.WebmOpus });
    player.play(resource);

    await entersState(player, AudioPlayerStatus.Playing, 10 * 1000);
    await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);

    connection.destroy();

    await interaction.followUp('音楽を再生しました！');
  },
};
