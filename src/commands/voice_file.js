const fs = require('fs').promises;
const VoiceFileHandler = require('../voice_file_handler.js');
const characters = require('../../resources/characters.json');
const emotions = require('../../resources/emotions.json');
const config = require('../../config.json');

const voiceFileHandler = new VoiceFileHandler(characters, emotions);

module.exports = {
    name: 'Voice File',
    command: new RegExp(`^${config.prefix}[a-z][a-z][a-zA-Z]? `),
    format: `${config.prefix}xxy message`,
    description: 'Sends a .wav file of the generated voice for the selected character, emotion (optional), and message.',
    exec: async (message) => {
        const result = await voiceFileHandler.getVoiceFile(message);
        if (!result) return;

        await message.channel.send({ content: `${message.member}`, files: [result.file] });
        fs.unlink(result.file).catch((error) => console.log('Failed to delete temp file: \n', error));
    },
};
