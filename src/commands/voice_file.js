const fs = require('fs').promises;
const sendRequest = require('../api_handler.js').sendRequest;
const parseMessage = require('../message_parser.js').parseMessage;
const config = require('../../config.json');
const characters = require('../../resources/characters.json');

const characterCodeLength = Object.keys(characters)[0].length;

module.exports = {
    name: 'Voice File',
    command: new RegExp(`^${config.prefix}[a-zA-Z]{${characterCodeLength}} `),
    format: `${config.prefix}xxx message`,
    description: 'Sends a .wav file of the generated voice for the selected character and message.',
    exec: async (message) => {
        const data = await parseMessage(message, characters);
        if (!data) return;
        const result = await sendRequest(message, data);
        if (!result) return;

        await message.channel.send({ content: `${message.member} \nEmotions: ${result.emotions.join(' ')}`, files: [result.file] });
        fs.unlink(result.file).catch((error) => console.log('Failed to delete temp file: \n', error));
    },
};
