const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const osUtils = require('os-utils');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('M.のシステム情報を表示します。'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const cpuUsage = await getCpuUsage();
      const memUsage = await getMemoryUsage();
      const nodeVersion = process.versions.node;
      const osVersion = os.version();
      const kernelVersion = os.release();
      const cpuInfo = `CPU: ${os.cpus()[0].model}, コア数: ${os.cpus().length}, スレッド数: ${os.cpus()[0].times.length}`;
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const packageVersion = require('../package.json').version;

      let debianVersion = null;
      let updatesAvailable = null;

      if (os.platform() === 'linux') {
        const { stdout: lsbRelease } = await execPromise('lsb_release -d');
        debianVersion = lsbRelease.split(':')[1].trim();

        const { stdout: aptUpdates } = await execPromise('apt list --upgradable');
        const updateLines = aptUpdates.split('\n').filter(line => line && !line.startsWith('Listing...'));
        updatesAvailable = updateLines.length > 0 ? `${updateLines.length} パッケージのアップデートがあります。` : 'アップデートはありません。';
      }

      const embed = new MessageEmbed()
        .setColor('#000000')
        .setTitle('システム情報グラフ')
        .addField('BOTのバージョン', packageVersion, true)
        .addField('Node.jsバージョン', nodeVersion)
        .addField('OSバージョン', osVersion)
        .addField('カーネルバージョン', kernelVersion)
        .addField('CPU情報', cpuInfo)
        .addField('タイムゾーン', timeZone)
        .addField('CPU利用率', createBarGraph(cpuUsage, 'white', 'black'), true)
        .addField('メモリ利用率', createBarGraph(memUsage, 'white', 'black'), true);

      if (debianVersion) {
        embed.addField('Debianバージョン', debianVersion);
      }

      if (updatesAvailable) {
        embed.addField('アップデート情報', updatesAvailable);
      }

      interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      interaction.editReply('システム情報のグラフ表示中にエラーが発生しました。');
    }
  },
};

async function getCpuUsage() {
  return new Promise((resolve, reject) => {
    osUtils.cpuUsage((usage) => {
      if (usage === null) {
        reject(new Error('CPU利用率の取得中にエラーが発生しました。'));
      } else {
        resolve((usage * 100).toFixed(2));
      }
    });
  });
}

async function getMemoryUsage() {
  return new Promise((resolve) => {
    const totalMemory = osUtils.totalmem();
    const freeMemory = osUtils.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memUsagePercentage = (usedMemory / totalMemory) * 100;
    resolve(memUsagePercentage.toFixed(2));
  });
}

function createBarGraph(percentage, textColor, barColor) {
  const maxBars = 10;
  const filledBars = Math.round((percentage / 100) * maxBars);
  const emptyBars = maxBars - filledBars;
  const usageText = percentage + '%';

  const bar = `\`\`\`
${'█'.repeat(filledBars)}${' '.repeat(emptyBars)} ${usageText}
\`\`\``;

  return bar;
}
