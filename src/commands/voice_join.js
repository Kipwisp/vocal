const fs = require('fs').promises;
const VoiceFileHandler = require('../voice_file_handler.js');
const QueueHandler = require('../queue_handler.js');
const characters = require('../../resources/characters.json');
const emotions = require('../../resources/emotions.json');
const config = require('../../config.json');

const DELAY = 2000;
const voiceFileHandler = new VoiceFileHandler(characters, emotions);
const queueHandler = new QueueHandler(async (guildID, request, speaking) => {
    if (!speaking) {
        fs.unlink(request.file).catch((error) => console.log('Failed to delete temp file: \n', error));
        setTimeout(() => {
            if (!queueHandler.isFinished(guildID)) {
                queueHandler.play(guildID);
            }
        }, DELAY);
    }
});

module.exports = {
    name: 'Voice Join',
    command: new RegExp(`^${config.prefix}[a-zA-Z][a-zA-Z][a-zA-Z]?\\+ `),
    format: `${config.prefix}xxy+ message`,
    description: 'Joins the voice channel the user is in and plays the generated voice for the selected character, emotion (optional), and message.',
    exec: async (message) => {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.channel.send(`${message.member} Please join a voice channel before using that command.`);
            return;
        }

        const result = await voiceFileHandler.getVoiceFile(message);
        if (!result) return;

        const isPlaying = queueHandler.addToQueue(message.guild.id, result);

        if (!isPlaying) {
            await queueHandler.joinVoiceChannel(message.guild.id, voiceChannel);
            queueHandler.play(message.guild.id);
        }
    },
};
