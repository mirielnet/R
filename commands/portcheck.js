const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const net = require('net');
const dgram = require('dgram');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('portcheck')
    .setDescription('指定したIPアドレスまたはドメインのTCPとUDPポートをチェックします。')
    .addStringOption(option =>
      option
        .setName('server')
        .setDescription('IPアドレスまたはドメインを入力してください。')
    )
    .addIntegerOption(option =>
      option
        .setName('tcpport')
        .setDescription('TCPポート番号を入力してください。')
    )
    .addIntegerOption(option =>
      option
        .setName('udpport')
        .setDescription('UDPポート番号を入力してください。')
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const server = interaction.options.getString('server');
    const tcpPort = interaction.options.getInteger('tcpport');
    const udpPort = interaction.options.getInteger('udpport');

    if (!tcpPort && !udpPort) {
      await interaction.editReply('どちらも指定されていません。');
      return;
    }

    let tcpStatus, udpStatus;

    function checkDone() {
      if (tcpStatus !== undefined && udpStatus !== undefined) {
        const embed = new MessageEmbed()
          .setColor('#00ff00')
          .setTitle('ポートチェック結果')
          .addField('サーバー', server || '未指定')
          .addField('TCPポート', tcpPort ? tcpPort.toString() : '未指定')
          .addField('TCPステータス', tcpStatus || '未実行')
          .addField('UDPポート', udpPort ? udpPort.toString() : '未指定')
          .addField('UDPステータス', udpStatus || '未実行');

        interaction.editReply({ embeds: [embed] });
      }
    }

    async function checkTCP() {
      const tcpSocket = new net.Socket();
      tcpSocket.setTimeout(3000);

      tcpSocket.on('connect', () => {
        tcpSocket.destroy();
        tcpStatus = '開いています';
        checkDone();
      });

      tcpSocket.on('timeout', () => {
        tcpSocket.destroy();
        tcpStatus = '閉じています';
        checkDone();
      });

      tcpSocket.on('error', (error) => {
        tcpSocket.destroy();
        console.error(error);
        tcpStatus = 'エラー';
        checkDone();
      });

      if (tcpPort) {
        tcpSocket.connect(tcpPort, server);
      } else {
        tcpStatus = '未実行';
        checkDone();
      }
    }

    async function checkUDP() {
      if (!udpPort) {
        udpStatus = '未実行';
        checkDone();
        return;
      }

      const udpSocket = dgram.createSocket('udp4');

      udpSocket.on('listening', () => {
        udpSocket.close();
        udpStatus = '開いています';
        checkDone();
      });

      udpSocket.on('error', (error) => {
        udpSocket.close();
        console.error(error);
        udpStatus = '閉じています';
        checkDone();
      });

      udpSocket.bind(udpPort);
    }

    await Promise.all([checkTCP(), checkUDP()]);
  },
};
