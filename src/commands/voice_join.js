const fs = require('fs').promises;
const helper = require('../voice_file_request.js');
const QueueHandler = require('../queue_handler.js');
const config = require('../../config.json');

const DELAY = 2000;
const queueHandler = new QueueHandler(async (guildID, request, speaking) => {
    if (!speaking) {
        fs.unlink(request.file).catch((error) => console.log('Failed to delete temp file: \n', error));
        setTimeout(() => {
            queueHandler.finishPlaying(guildID);
        }, DELAY);
    }
});

module.exports = {
    name: 'Voice Join',
    command: new RegExp(`^${config.prefix}[a-z][a-z][a-zA-Z]?\\+ `),
    format: `${config.prefix}xxy+ message`,
    description: 'Joins the voice channel the user is in and plays the generated voice for the selected character, emotion (optional), and message.',
    exec: async (message) => {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.channel.send(`${message.member} Please join a voice channel before using that command.`);
            return;
        }

        const result = await helper.getVoiceFile(message);
        if (!result) return;

        queueHandler.addToQueue(message.guild.id, result);
        queueHandler.startPlaying(message.guild.id, voiceChannel);
    },
};
