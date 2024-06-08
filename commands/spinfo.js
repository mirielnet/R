const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sp-info')
    .setDescription('Spotifyの曲情報を取得します。')
    .addStringOption(option =>
      option
        .setName('track-url')
        .setDescription('曲のURLを入力してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

      // アクセストークンを取得
      const authResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
        grant_type: 'client_credentials',
      }), {
        auth: {
          username: clientId,
          password: clientSecret,
        },
      });

      const accessToken = authResponse.data.access_token;
      const trackUrl = interaction.options.getString('track-url');

      // トラックIDを抽出
      const trackIdMatch = trackUrl.match(/\/track\/(\w+)/);
      if (!trackIdMatch) {
        await interaction.reply('無効な曲のURLです。');
        return;
      }

      const trackId = trackIdMatch[1];

      // Spotify APIにリクエストして曲情報を取得
      const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const trackInfo = response.data;
      const trackName = trackInfo.name;
      const artistNames = trackInfo.artists.map(artist => artist.name).join(', ');
      const albumName = trackInfo.album.name;
      const trackUrlSpotify = trackInfo.external_urls.spotify;

      // テキストで曲情報を出力
      await interaction.reply(`曲名: ${trackName}\nアーティスト: ${artistNames}\nアルバム: ${albumName}\nSpotify URL: ${trackUrlSpotify}`);

    } catch (error) {
      console.error(error);
      await interaction.reply('曲情報を取得できませんでした。後でもう一度お試しください。');
    }
  },
};
