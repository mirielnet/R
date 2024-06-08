const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  data: {
    name: 'invite',
    description: 'BOTの招待リンクを表示します。',
  },
  async execute(interaction) {
    const inviteLink = await interaction.client.generateInvite({
      scopes: ['applications.commands', 'bot'],
    });

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('BOTを招待する')
          .setStyle('LINK')
          .setURL(inviteLink)
      );

    await interaction.reply({ content: 'BOTを招待するためのリンクです。', components: [row] });
  },
};
