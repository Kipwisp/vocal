const fs = require('fs').promises;
const helper = require('../voice_file_request.js');
const config = require('../../config.json');

module.exports = {
    name: 'Voice File',
    command: new RegExp(`^${config.prefix}[a-z][a-z][a-zA-Z]? `),
    format: `${config.prefix}xxy message`,
    description: 'Sends a .wav file of the generated voice for the selected character, emotion (optional), and message.',
    exec: async (message) => {
        const result = await helper.getVoiceFile(message);
        if (!result) return;

        await message.channel.send({ content: `${message.member}`, files: [result.file] });
        try {
            fs.unlink(result.file).catch((error) => console.log('Failed to delete temp file: \n', error));
        } catch (error) {
            console.log('An error occurred: \n', error);
        }
    },
};
