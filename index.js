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

// Function to update status message
function updateStatus() {
  const newStatus = STATUS_MESSAGES[Math.floor(Math.random() * STATUS_MESSAGES.length)];
  if (newStatus !== currentStatus) {
    client.user.setActivity(newStatus);
    currentStatus = newStatus;
  }
}

client.once('ready', () => {
  console.log('Botがオンラインになりました！');
  // Update status message periodically when the bot is ready
  updateStatus();
  setInterval(updateStatus, 60 * 1000); // Update status every 60 seconds

  // Load Discord.js commands
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
      commands.set(command.data.name, command);
      // Register slash commands with Discord
      client.application?.commands.create(command.data)
        .catch(console.error);
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
  } catch (error) {
    console.error(error);
    await interaction.reply('コマンドの実行中にエラーが発生しました。');
  }
});


client.login(TOKEN);