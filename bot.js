const Discord = require('discord.js');
const bent = require('bent')
const fs = require('fs') 
const properties = require('./resources/properties.js')
const config = require("./config.json");

const client = new Discord.Client();
const post = bent(properties.api, 'POST', 'buffer', properties.headers);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
 });

client.on('message', async msg => {
    if (msg.content === 'ping') {
        let data = {text:'Hello this is working!', character:'Twilight Sparkle'};
        console.log("Processing request");

        await post('', data).then(response => {
            fs.writeFile('Output.wav', response, (err) => { 
                if (err) throw err; 
            }) 
        }).catch(console.error);

        console.log("Finished");
    }
 });

client.login(config.token);