const bent = require('bent')
const fs = require('fs').promises 
const characters = require("../resources/characters.json")
const config = require("../config.json");
const post = bent('https://api.fifteen.ai/app/getAudioFile', 'POST', 'buffer', {
        'Host': 'api.fifteen.ai',
        'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/74.0',
        'Access-Control-Allow-Origin': '*',
        'Origin': 'https://fifteen.ai',
        'Referer': 'https://fifteen.ai/app'
    });

async function parseText(text) {
  const filteredText = text.replace(/[^A-Z _.,!?:']/gi, '');
  const lastChar = filteredText[filteredText.length - 1];

  return ['.', ',', ':', '!', '?'].includes(lastChar)
    ? filteredText
    : filteredText + '.';
}

module.exports = {  
    name: 'voice',
    command: new RegExp(`^${config.prefix}[a-z][a-z] `),
    exec: async (message) => { 
        let character = message.content.substring(config.prefix.length, config.prefix.length + 2);
        if (!(character in characters)) {
            await message.reply(`That character code is invalid. Say ${config.prefix}help to view valid codes.`);
            return;
        }

        let text = await parseText(message.content.substring(config.prefix.length + 3));
        if (text.length > config.char_limit) {
            let difference = text.length - config.char_limit;
            await message.channel.send(`Your message is ${difference} character${difference == 1 ? '' : 's'} over the character limit (${config.char_limit} characters max).`);
            return;
        }

        let sentMessage = await message.reply('Hold on, this might take a bit...');

        let data = {text:text, character:characters[character]};
        console.log("Sending request...");

        try {
            let response = await post('', data);
            let file = `${character}_${text.replace(/[^A-Z _']/gi, '')}.wav`;
            console.log("Retrieved data successfully.");
            console.log("Processing data...");

            await fs.writeFile(file, response);

            await message.reply({ files: [file] });
            sentMessage.delete();

            fs.unlink(file).catch(error => console.log("Failed to delete temp file: \n", error));
        } catch (error) {
            console.log("An error occurred: \n", error);
            await message.reply('Sorry, your request failed. Try again.');
            sentMessage.delete();
        }
        
        console.log("Finished processing. \n");
    }
};