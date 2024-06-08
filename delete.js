const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
  throw new Error('DISCORD_BOT_TOKEN is not set in .env file');
}
if (!clientId) {
  throw new Error('CLIENT_ID is not set in .env file');
}

// コマンドライン引数からコマンド名を取得
const args = process.argv.slice(2);
const commandName = args[1];

if (!commandName) {
  throw new Error('Command name to delete must be specified');
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    // グローバルコマンドの削除
    const globalCommands = await rest.get(Routes.applicationCommands(clientId));
    for (const command of globalCommands) {
      if (command.name === commandName) {
        await rest.delete(`${Routes.applicationCommand(clientId, command.id)}`);
        console.log(`Deleted global command ${command.name}`);
      }
    }

    // ギルドコマンドの削除（必要に応じて）
    if (guildId) {
      const guildCommands = await rest.get(Routes.applicationGuildCommands(clientId, guildId));
      for (const command of guildCommands) {
        if (command.name === commandName) {
          await rest.delete(`${Routes.applicationGuildCommand(clientId, guildId, command.id)}`);
          console.log(`Deleted guild command ${command.name} in guild ${guildId}`);
        }
      }
    }

    console.log(`Command ${commandName} deleted successfully.`);
  } catch (error) {
    console.error(error);
  }
})();
