const bent = require('bent');
const crypto = require('crypto');
const fs = require('fs').promises;
const characters = require('../resources/characters.json');
const emotions = require('../resources/emotions.json');
const config = require('../config.json');

const post = bent('https://api.fifteen.ai/app/getAudioFile', 'POST', 'buffer', {
    Host: 'api.fifteen.ai',
    'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/74.0',
    'Access-Control-Allow-Origin': '*',
    Origin: 'https://fifteen.ai',
    Referer: 'https://fifteen.ai/app',
});

const FILE_NAME_LIMIT = 50;

async function parseText(text) {
    const filteredText = text.replace(/[^A-Z _.,!?:']/gi, '');
    const lastChar = filteredText[filteredText.length - 1];

    return ['.', ',', ':', '!', '?'].includes(lastChar)
        ? filteredText
        : `${filteredText}.`;
}

async function parseMessage(message) {
    const code = message.content.substring(config.prefix.length, message.content.indexOf(' '));

    const character = code.substr(0, 2);
    if (!(character in characters)) {
        await message.channel.send(`${message.member} That character code is invalid. Say ${config.prefix}help to view valid codes.`);
        return null;
    }
    const characterName = characters[character].name;

    let emotionName;
    const characterEmotions = characters[character].emotions;
    if (code.match(RegExp('[a-z][a-z][a-zA-Z]\\+?$'))) {
        const emotion = code.substr(2, 1);
        if (!(emotion in emotions)) {
            await message.channel.send(`${message.member} That emotion code is invalid. Say ${config.prefix}help to view valid codes.`);
            return null;
        }
        emotionName = emotions[emotion];

        if (!characterEmotions.includes(emotionName)) {
            await message.channel.send(`${message.member} That character does not have that emotion. Say ${config.prefix}help to view valid character emotions.`);
            return null;
        }
    } else {
        emotionName = characterEmotions[0];
    }

    const text = await parseText(message.content.substr(message.content.indexOf(' ') + 1));
    if (text.length > config.char_limit) {
        const difference = text.length - config.char_limit;
        await message.channel.send(`${message.member} Your message is ${difference} character${difference === 1 ? '' : 's'} over the character limit (${config.char_limit} characters max).`);
        return null;
    }

    return {
        text, character: characterName, emotion: emotionName, code,
    };
}

async function getResponse(data) {
    try {
        const response = await post('', data);
        console.log('Retrieved data successfully.');
        console.log('Processing data...');

        return response;
    } catch (error) {
        console.log('An error occurred: \n', error);
    }

    return null;
}

module.exports = {
    getVoiceFile: async (message) => {
        const data = await parseMessage(message);
        if (!data) return null;

        const sentMessage = await message.channel.send(`${message.member} Hold on, this might take a bit...`);
        const file = `tmp/${data.code}_${data.text.replace(/[^A-Z _']/gi, '').substr(0, FILE_NAME_LIMIT)}_${crypto.randomBytes(2).toString('hex')}.wav`;

        console.log('Sending request...');
        const response = await getResponse(data);
        sentMessage.delete();

        if (!response) {
            await message.channel.send(`${message.member} Sorry, your request failed. Try again.`);
            return null;
        }

        await fs.writeFile(file, response);
        console.log('Finished processing.');

        return {
            file,
            character: data.character,
            emotion: data.emotion,
            line: data.text,
            member: message.member,
        };
    },
    parseMessage,
};
