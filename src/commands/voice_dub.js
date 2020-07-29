const VoiceFileHandler = require('../voice_file_handler.js');
const characters = require('../../resources/characters.json');
const config = require('../../config.json');

const voiceFileHandler = new VoiceFileHandler(characters);

module.exports = {
    name: 'Voice Dub',
    command: new RegExp(`^${config.prefix}voicedub [1-9]( -[a-z][a-z]([01].[0-9][0-9])?)*$`),
    format: `${config.prefix}voicedub n -xxy.yy -xxy.yy -xxy.yy ...`,
    description: 'Generates a voice dub of the last n messages using the specified characters or random characters otherwise.',
    exec: async (message) => {
        voiceFileHandler.sendDubVoiceFile(message);
    },
};
