const { Client, Intents, MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();
const TOKEN = process.env.TOKEN;
const STATUS_MESSAGES = JSON.parse(process.env.STATUS_MESSAGES);
let currentStatus = '';

if (!TOKEN) {
  console.error('Discordボットトークンが設定されていません。');
  process.exit(1);
}

// Define necessary intents
const intents = new Intents([
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  // Add more intents as needed
]);

const client = new Client({ intents });
const commands = new Map();

// Custom logger function
function log(level, message, file = '') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${file ? `[${file}] ` : ''}${message}`;
  console.log(logMessage);
  // You could also append logs to a file if needed
  // fs.appendFileSync('bot.log', logMessage + '\n');
}

// Function to update status message
function updateStatus() {
  const newStatus = STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)];
  if (newStatus !== currentStatus) {
    client.user.setActivity(newStatus);
    currentStatus = newStatus;
  }
}

// Get versions
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const nodeVersion = process.version;
const botVersion = packageJson.version;

client.once('ready', () => {
  log('INFO', `M.OS Ver.${botVersion}`);
  log('INFO', `Node.js Ver.${nodeVersion}`);
  log('INFO', 'DISCORD LOGIN OK');
  
  // Update status message periodically when the bot is ready
  updateStatus();
  setInterval(updateStatus, 60 * 1000); // Update status every 60 seconds

  // Load Discord.js commands
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    try {
      const command = require(`./commands/${file}`);
      if (command.data) {
        commands.set(command.data.name, command);
        // Register slash commands with Discord
        client.application?.commands.create(command.data)
          .then(() => log('INFO', `Command registered: ${command.data.name}`, file))
          .catch(error => log('ERROR', `Failed to register command: ${error}`, file));
      }
    } catch (error) {
      log('ERROR', `Failed to load command file: ${error}`, file);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  const command = commands.get(commandName);

  if (!command) return;

  try {
    // Execute the slash command
    await command.execute(interaction);
    log('INFO', `Command executed: ${commandName}`, `${commandName}.js`);
  } catch (error) {
    log('ERROR', `Command execution failed: ${error}`, `${commandName}.js`);
    try {
      await interaction.reply('コマンドの実行中にエラーが発生しました。');
    } catch (replyError) {
      log('ERROR', `Failed to send error reply: ${replyError}`, `${commandName}.js`);
    }
  }
});

client.login(TOKEN).catch(error => log('ERROR', `Login failed: ${error}`));
