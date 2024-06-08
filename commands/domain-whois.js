　const whois = require('whois');

module.exports = {
  data: {
    name: 'domain-whois',
    description: '指定されたドメインのWHOIS情報を表示します。',
    options: [
      {
        name: 'domain',
        description: 'WHOIS情報を表示するドメインを入力してください。',
        type: 'STRING',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const { options } = interaction;
    const domain = options.getString('domain');

    try {
      const whoisData = await getWhoisInfo(domain);
      const relevantInfo = extractRelevantInfo(whoisData);
      await interaction.reply({ content: relevantInfo });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'WHOIS情報の取得中にエラーが発生しました。' });
    }
  },
};

function getWhoisInfo(domain) {
  return new Promise((resolve, reject) => {
    whois.lookup(domain, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

function extractRelevantInfo(whoisData) {
  const lines = whoisData.split('\n');
  const relevantLines = lines.filter(line =>
    line.startsWith('Domain Name:') ||
    line.startsWith('Registry Expiry Date:') ||
    line.startsWith('Updated Date:') ||
    line.startsWith('Registrar:') ||
    line.startsWith('Creation Date:') ||
    line.startsWith('Name Server:') ||
    line.startsWith('Registrant Organization:') ||
    line.startsWith('Registrant Name:') ||
    line.startsWith('Registrant Street:')
  );

  const relevantInfo = relevantLines.join('\n');
  return relevantInfo;
}
