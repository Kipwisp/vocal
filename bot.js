const Discord = require('discord.js');
const fs = require('fs');
const config = require("./config.json");
const Vocal = require("./src/vocal.js")

function run() {
    let client = new Discord.Client();
    let bot = new Vocal();

    let tmpDir = 'tmp';
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
        console.log("Created tmp directory.");
    }

    client.on('ready', async () => { bot.setActivity(client) });
    client.on('message', async (message) => { bot.handleMessage(message) });

    client.login(config.token);
}

run();