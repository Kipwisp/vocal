const Discord = require('discord.js');
const fs = require('fs');
const commands = require("./commands/commands.js");
const config = require("./config.json");

const client = new Discord.Client();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}! \n`);
    try {
        await client.user.setActivity(`${config.prefix}help`, { type: 'WATCHING' });
    } catch (error) {
        console.log("Failed to set activity.");
    }
 });

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    for (command of commands.commands) {
        if (message.content.match(command.command)) {
            command.exec(message);
            break;
        }
    }
});

let tmpDir = 'tmp';
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
    console.log("Created tmp directory.");
}

client.login(config.token);
