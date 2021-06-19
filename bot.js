const Discord = require('discord.js');
const fs = require('fs');
const auth = require('./auth.json');
const Vocal = require('./src/vocal.js');

function run() {
    const client = new Discord.Client();
    const bot = new Vocal();

    const tmpDir = 'tmp';
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
        console.log('Created tmp directory.');
    }

    client.on('ready', async () => { bot.setActivity(client); });
    client.on('message', async (message) => { bot.handleMessage(message); });

    client.login(auth.token);
}

run();
