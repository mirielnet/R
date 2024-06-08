const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname, 'commands');
const outputFilePath = path.join(__dirname, 'COMMANDS.md');

// コマンドファイルを読み込む
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

let documentation = '# Command List\n\n';

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  documentation += `## ${command.data.name}\n`;
  documentation += `${command.data.description}\n\n`;
}

// ドキュメントファイルを書き出す
fs.writeFileSync(outputFilePath, documentation);

console.log('Documentation generated successfully!');
