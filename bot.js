const Discord = require('discord.js');
const bent = require('bent')
const fs = require('fs') 
const properties = require('./resources/properties.js')
const characters = require("./resources/characters.json")
const config = require("./config.json");

const client = new Discord.Client();
const post = bent(properties.api, 'POST', 'buffer', properties.headers);

async function parseText(text) {
  const filteredText = text.replace(/[^A-Z _.,!?:']/gi, '');
  const lastChar = filteredText[filteredText.length - 1];

  return ['.', ',', ':', '!', '?'].includes(lastChar)
    ? filteredText
    : filteredText + '.';
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
 });

client.on('message', async message => {
    if (message.content === `${config.prefix}help`) {
        let helpMessage = `Usage: ${config.prefix}xx message \nCharacter codes: \n`;
        for (character in characters) {
            helpMessage += `${character}: ${characters[character]} \n`;
        }
        message.reply(helpMessage);
    }
    else if (message.content.match(new RegExp(`^${config.prefix}[a-z][a-z] `))) {
        let length = message.content.substring(config.prefix.length + 3).length;
        if (length > config.char_limit) {
            message.channel.send(`Your message is ${length - config.char_limit} characters over the character limit (${config.char_limit}).`);
            return;
        }

        let sentMessage = await message.reply('Hold on, this might take a bit...');
        let character = message.content.substring(config.prefix.length, config.prefix.length + 2);
        let text = message.content.substring(config.prefix.length + 3);
        let parsedText = await parseText(text);
        let data = {text:parsedText, character:characters[character]};

        if (!(character in characters)) {
            await message.reply(`That character code is invalid. Say ${config.prefix}help to view valid codes.`);
            sentMessage.delete();
            return;
        }
        
        console.log("Sending request...");
        try {
            let response = await post('', data);
            let file = `${text.replace(/[^A-Z _']/gi, '')}.wav`;
            console.log("Retrieved data successfully.");
            console.log("Processing data...");

            fs.writeFile(file, response, (err) => { 
                if (err) {
                    console.log("Failed to write data.");
                    throw err;
                }
            }); 

            await message.reply({ files: [file] });
            sentMessage.delete();

            fs.unlinkSync(file, (err) => {
                if (err) {
                    console.log("Failed to delete temp files.");
                }
            });
        } catch (error) {
            console.log(error);
            await message.reply('Sorry, your request failed. Try again.');
            sentMessage.delete();
        }
        
        console.log("Finished processing. \n");
    }
});

client.login(config.token);

