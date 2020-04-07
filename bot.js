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
    if (msg.content === "ping") {
        let sentMessage = await msg.channel.send('Hold on this might take a bit...');
        let data = {text:'Hello this is working!', character:'Twilight Sparkle'};
        
        console.log("Processing request...");
        try {
            let response = await post('', data);
            let file = 'output.wav';
            
            fs.writeFile(file, response, (err) => { 
                if (err) {
                    console.log("Failed to write data.")
                }
            }); 

            await msg.channel.send({ files: [file] });
            sentMessage.delete();
            fs.unlinkSync(file, (err) => {
                if (err) {
                    console.log("Failed to delete temp files.")
                }
            });
        } catch (error) {
            console.error;
            msg.channel.send('Sorry, your request failed. Try again.');
            sentMessage.delete();
        }
        
        console.log("Finished processing");
    }
});

client.login(config.token);