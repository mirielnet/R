const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('senddm')
    .setDescription('指定したユーザーにDMを送信します。')
    .addUserOption(option => option.setName('user').setDescription('ユーザーを指定してください。').setRequired(true))
    .addStringOption(option => option.setName('content').setDescription('DMの内容を入力してください。').setRequired(true)),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user');
      const content = interaction.options.getString('content');

      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setDescription(content);

      await user.send({ embeds: [embed] });

      await interaction.reply('DMを送信しました。');
    } catch (error) {
      console.error(error);
      await interaction.reply('DMの送信中にエラーが発生しました。');
    }
  },
};

