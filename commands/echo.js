const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('入力した言葉をオウム返しします。')
    .addStringOption(option => 
      option.setName('word')
      .setDescription('オウム返ししたい言葉を入力してください。')
      .setRequired(true)),

  async execute(interaction) {
    const word = interaction.options.getString('word');
    await interaction.reply(word);
  },
};
