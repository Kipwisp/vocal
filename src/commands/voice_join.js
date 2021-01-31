const sendRequest = require('../api_handler.js').sendRequest;
const queueHandler = require('../queue_handler.js');
const parseMessage = require('../message_parser.js').parseMessage;
const config = require('../../config.json');
const characters = require('../../resources/characters.json');

const characterCodeLength = Object.keys(characters)[0].length;

module.exports = {
    name: 'Voice Join',
    command: new RegExp(`^${config.prefix}[a-zA-Z]{${characterCodeLength}}\\+ `),
    format: `${config.prefix}xxx+ message`,
    description: 'Joins the voice channel the user is in and plays the generated voice for the selected character and message.',
    exec: async (message) => {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.channel.send(`${message.member} Please join a voice channel before using that command.`);
            return;
        }

        const data = await parseMessage(message, characters);
        if (!data) return;

        const result = await sendRequest(message, data);
        if (!result) return;

        queueHandler.addRequest(message.guild.id, result, voiceChannel);
    },
};
