const sendDub = require('../dub_generator.js').sendDub;
const config = require('../../config.json');
const characters = require('../../resources/characters.json');
const emotions = require('../../resources/emotions.json');

module.exports = {
    name: 'Voice Dub',
    command: new RegExp(`^${config.prefix}voicedub [1-9]( -[a-zA-Z][a-zA-Z][a-zA-Z]?)*$`),
    format: `${config.prefix}voicedub n -xxy -xxy -xxy ...`,
    description: 'Generates a voice dub of the last n messages using the specified characters or random characters otherwise.',
    exec: async (message) => {
        sendDub(message, characters, emotions);
    },
};
