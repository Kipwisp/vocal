const sendDub = require('../dub_generator').sendDub;
const config = require('../../config.json');
const characters = require('../../resources/characters.json');

const characterCodeLength = Object.keys(characters)[0].length;

module.exports = {
	name: 'Voice Dub',
	command: new RegExp(`^${config.prefix}voicedub [1-9]( -[a-zA-Z]{${characterCodeLength}})*$`),
	format: `${config.prefix}voicedub n -xxx -xxx -xxx ...`,
	description: 'Generates a voice dub of the last n messages using the specified characters or random characters otherwise.',
	exec: async (message) => {
		sendDub(message, characters);
	},
};
