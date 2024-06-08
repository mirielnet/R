const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const dns = require('dns').promises;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mailcheck')
    .setDescription('指定したメールアドレスのSPF、DKIM、DMARC設定を確認します。')
    .addStringOption(option =>
      option
        .setName('email')
        .setDescription('メールアドレスを指定してください。')
        .setRequired(true)
    ),

  async execute(interaction) {
    const email = interaction.options.getString('email');
    const domain = email.split('@')[1];

    try {
      // Check SPF record
      const spfResult = await dns.resolveTxt(`${domain}`);
      const spfRecord = spfResult.find(record => record[0].startsWith('v=spf1'));
      const spfStatus = spfRecord ? '設定済み' : '未設定';

      // Check DKIM record
      const hasDkim = await hasDkimRecord(domain);

      // Check DMARC record
      const dmarcHostname = `_dmarc.${domain}`;
      const dmarcStatus = await checkDmarcStatus(dmarcHostname);

      // Create and send an Embed with the information
      const embed = new MessageEmbed()
        .setTitle(`${email} のメール設定結果`)
        .setColor('#0099ff')
        .addField('SPF', spfStatus)
        .addField('DKIM', hasDkim ? '設定済み' : '未設定')
        .addField('DMARC', dmarcStatus);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply('メールアドレスの設定を確認中にエラーが発生しました。');
    }
  },
};

async function hasDkimRecord(domain) {
  try {
    const txtRecords = await dns.resolveTxt(domain);
    return txtRecords.some(record => record.join(' ').includes('v=DKIM1;'));
  } catch (error) {
    if (error.code === 'ENODATA') {
      return false;
    } else {
      throw error;
    }
  }
}

async function checkDmarcStatus(hostname) {
  try {
    const dmarcResult = await dns.resolveTxt(hostname);
    const hasDmarcRecord = dmarcResult.some(record => record[0].startsWith('v=DMARC1'));
    return hasDmarcRecord ? '設定済み' : '未設定';
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      return '未設定';
    } else {
      throw error;
    }
  }
}
