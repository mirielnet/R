const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('twiurl')
    .setDescription('指定したTwitterツイートURLをvxtwitter.comに変換します。')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('TwitterツイートURLを指定してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    const twitterUrl = interaction.options.getString('url');
    const modifiedUrl = twitterUrl.replace('twitter.com', 'vxtwitter.com'); // twitter.comをvxtwitter.comに置換

    await interaction.reply(`変換後のURL: ${modifiedUrl}`);
  },
};
