const VoiceFileRequester = require('../voice_file_handler.js');
const characters = require('../../resources/characters.json');
const emotions = require('../../resources/characters.json');
const config = require('../../config.json');

const voiceFileRequester = new VoiceFileRequester(characters, emotions);

module.exports = {
    name: 'Voice Dub',
    command: new RegExp(`^${config.prefix}voicedub [1-9] (-[a-z][a-z][a-zA-Z]?)*$`),
    format: `${config.prefix}voicedub n -xx -xx -xx ...`,
    description: 'Generates a voice dub of the last n messages using the specified characters or random characters otherwise.',
    exec: async (message) => {
        voiceFileRequester.getDubVoiceFile(message);
    },
};
