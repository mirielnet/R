const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pingを計測します。'),

  async execute(interaction) {
    const startTime = Date.now();
    await interaction.reply('Pinging...');
    const endTime = Date.now();
    const ping = endTime - startTime;
    await interaction.editReply(`Pong! レイテンシ: ${ping}ms`);
  },
};