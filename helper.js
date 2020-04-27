const bent = require('bent');
const crypto = require('crypto');
const fs = require('fs').promises;
const characters = require("./resources/characters.json");
const emotions = require("./resources/emotions.json");
const config = require("./config.json");
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
    getVoiceFile: async (message) => { 
        let code = message.content.substring(config.prefix.length, message.content.indexOf(' '));

        let character = code.substr(0, 2);
        if (!(character in characters)) {
            await message.channel.send(`${message.member} That character code is invalid. Say ${config.prefix}help to view valid codes.`);
            return;
        }
        let characterName = characters[character]["name"];

        let emotionName;
        if (code.match(RegExp(`[a-z][a-z][a-zA-Z]\\+?$`))) {
            let emotion = code.substr(2, 1);
            if (!(emotion in emotions)) {
                await message.channel.send(`${message.member} That emotion code is invalid. Say ${config.prefix}help to view valid codes.`);
                return;
            }
            emotionName = emotions[emotion];

            if (!characters[character]["emotions"].includes(emotionName)) {
                await message.channel.send(`${message.member} That character does not have that emotion. Say ${config.prefix}help to view valid character emotions.`);
                return;
            }
        } else {
            emotionName = characters[character]["emotions"][0];
        }

        let text = await parseText(message.content.substr(message.content.indexOf(' ') + 1));
        if (text.length > config.char_limit) {
            let difference = text.length - config.char_limit;
            await message.channel.send(`${message.member} Your message is ${difference} character${difference == 1 ? '' : 's'} over the character limit (${config.char_limit} characters max).`);
            return;
        }

        let file = `tmp/${characterName}_${emotionName}_${text.replace(/[^A-Z _']/gi, '')} [${crypto.randomBytes(4).toString('hex')}].wav`;
        let sentMessage = await message.channel.send(`${message.member} Hold on, this might take a bit...`);

        let data = {text:text, character:characterName, emotion:emotionName};
        console.log("Sending request...");

        try {
            let response = await post('', data);
            console.log("Retrieved data successfully.");
            console.log("Processing data...");

            await fs.writeFile(file, response);
            sentMessage.delete();
        } catch (error) {
            console.log("An error occurred: \n", error);
            await message.channel.send(`${message.member} Sorry, your request failed. Try again.`);
            sentMessage.delete();
            return;
        }
        
        console.log("Finished processing.");

        return {"file": file, "character": characterName, "emotion": emotionName, "line": text, "member": message.member};
    }
}