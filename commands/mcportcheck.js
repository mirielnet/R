const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const net = require('net');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mcportcheck')
    .setDescription('Minecraftサーバーのポートを調べて表示します。')
    .addStringOption(option =>
      option
        .setName('server')
        .setDescription('MinecraftサーバーのIPアドレスやドメインを指定してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const server = interaction.options.getString('server');

    const checkPort = (port, protocol) => {
      return new Promise(resolve => {
        const socket = new net.Socket();
        const onError = () => {
          socket.destroy();
          resolve(false);
        };
        socket.setTimeout(5000);
        socket.on('error', onError);
        socket.on('timeout', onError);
        socket.connect(port, server, () => {
          socket.end();
          resolve(true);
        });
      });
    };

    try {
      const [isJavaPortOpen, isBedrockPortOpen] = await Promise.all([
        checkPort(25565, 'tcp'),
        checkPort(19132, 'udp'),
      ]);

      const embed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle(`${server} のポートチェック結果`)
        .addField('Java版のポート (25565)', isJavaPortOpen ? '開いています' : '閉じています')
        .addField('統合版のポート (19132)', isBedrockPortOpen ? '開いています' : '閉じています');

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply('ポートチェック中にエラーが発生しました。');
    }
  },
};
