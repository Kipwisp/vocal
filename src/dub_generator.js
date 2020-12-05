const fs = require('fs').promises;
const ffmpeg = require('fluent-ffmpeg');
const crypto = require('crypto');
const sendRequests = require('./api_handler.js').sendRequests;
const parseMessages = require('./message_parser.js').parseMessages;

const MAX_CHARS = 1300;
const RANDOM_BYTES = 4;

async function getMessages(message, amount) {
    const messageHandler = message.channel.messages;
    const messages = await messageHandler.fetch({ before: message.id, limit: amount });

    return [...messages.values()].reverse();
}

function extractArguments(message, characters, emotions) {
    const amount = message.content.substr(message.content.indexOf(' ') + 1, 1);
    const characterCodeLength = Object.keys(characters)[0].length;
    const emotionCodeLength = Object.keys(emotions)[0].length;

    const selectedCharacters = [];
    const codes = message.content.matchAll(new RegExp(`-[a-zA-Z]{${characterCodeLength}}([a-zA-Z]{${emotionCodeLength}})?`, 'g'));
    for (const code of codes) {
        const characterCode = code[0].substr(1, characterCodeLength);
        const emotionCode = code[0].substr(characterCodeLength + 1, emotionCodeLength);

        if (characterCode in characters) {
            selectedCharacters.push({
                name: characters[characterCode].name,
                emotion: ((emotionCode in emotions && characters[characterCode].emotions.includes(emotions[emotionCode])))
                    ? emotions[emotionCode] : characters[characterCode].emotions[0],
            });
        }
    }

    return { amount, selectedCharacters };
}

function createCastingCredits(data) {
    let credits = '>>> __**STARRING**__ \n';
    const members = [];

    for (const role of data) {
        if (!members.includes(role.member)) {
            credits += `${role.member} as *${role.character}*\n`;
            members.push(role.member);
        }
    }

    return credits;
}

async function sendDub(message, characters, emotions) {
    const sentMessage = await message.channel.send(`${message.member} Hold on, this might take a bit...`);
    const args = extractArguments(message, characters, emotions);
    const messages = await getMessages(message, args.amount);

    const data = await parseMessages(messages, characters, args.selectedCharacters);

    if (!data) {
        sentMessage.delete();
        message.channel.send(`${message.member} Sorry, one of the selected messages contains invalid input.`);
        return;
    }

    let charTotal = 0;
    for (const result of data) {
        charTotal += result.text.length;
    }

    if (charTotal > MAX_CHARS) {
        sentMessage.delete();
        message.channel.send(`${message.member} Sorry, the selected messages may result in a file that is too large to send.`);
        return;
    }

    const files = await sendRequests(data);

    if (files == null) {
        sentMessage.delete();
        message.channel.send(`${message.member} Sorry, your request failed. Try again.`);
        return;
    }

    const combinedFiles = ffmpeg(files[0]);
    for (let i = 1; i < files.length; ++i) {
        combinedFiles.input('resources/audio/spacing.wav').input(files[i]);
    }

    const result = `tmp/voicedub_${args.amount}_${crypto.randomBytes(RANDOM_BYTES).toString('hex')}.wav`;

    combinedFiles.on('error', (error) => {
        console.log('Failed to merge files:', error);

        sentMessage.delete();
        message.channel.send(`${message.member} Sorry, your request failed. Try again.`);

        for (const file of files) {
            fs.unlink(file).catch((err) => console.log('Failed to delete temp file: \n', err));
        }
    }).on('end', async () => {
        console.log('Merging finished.');
        sentMessage.delete();

        await message.channel.send(createCastingCredits(data));

        message.channel.send({ content: `${message.member}`, files: [result] }).then(() => {
            fs.unlink(result).catch((error) => console.log('Failed to delete temp file: \n', error));
        });

        for (const file of files) {
            fs.unlink(file).catch((error) => console.log('Failed to delete temp file: \n', error));
        }
    }).mergeToFile(result, 'tmp');
}

module.exports = { sendDub, _extractArguments: extractArguments };
