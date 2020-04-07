const Discord = require('discord.js');
const bent = require('bent')
const fs = require('fs') 
const properties = require('./resources/properties.js')
const config = require("./config.json");
const characters = require("./resources/characters.json")

const client = new Discord.Client();
const post = bent(properties.api, 'POST', 'buffer', properties.headers);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
 });

client.on('message', async message => {
    if (message.content[0] === config.prefix) {
        let length = message.content.substring(config.prefix.length + 3).length;
        if (length > config.char_limit) {
            message.channel.send(`Your message is ${length - config.char_limit} characters over the character limit (${config.char_limit}).`);
            return;
        }

        let sentMessage = await message.channel.send('Hold on this might take a bit...');
        let character = message.content.substring(config.prefix.length, config.prefix.length + 2);
        let line = message.content.substring(config.prefix.length + 3);
        let data = {text:line, character:characters[character]};
        
        console.log("Processing request...");
        try {
            let response = await post('', data);
            let file = `${line}.wav`;
            
            fs.writeFile(file, response, (err) => { 
                if (err) {
                    console.log("Failed to write data.")
                }
            }); 

            await message.channel.send({ files: [file] });
            sentMessage.delete();
            fs.unlinkSync(file, (err) => {
                if (err) {
                    console.log("Failed to delete temp files.")
                }
            });
        } catch (error) {
            console.log(error);
            message.channel.send('Sorry, your request failed. Try again.');
            sentMessage.delete();
        }
        
        console.log("Finished processing");
    }
});

client.login(config.token);