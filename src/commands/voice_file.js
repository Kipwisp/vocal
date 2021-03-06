const fs = require('fs').promises;
const sendRequest = require('../api_handler').sendRequest;
const parseMessage = require('../message_parser').parseMessage;
const config = require('../../config.json');
const characters = require('../../resources/characters.json');

const characterCodeLength = Object.keys(characters)[0].length;

module.exports = {
	name: 'Voice File',
	command: new RegExp(`^${config.prefix}[a-zA-Z]{${characterCodeLength}} `),
	format: `${config.prefix}xxx message`,
	description: 'Sends a file of the generated voice for the selected character and message.',
	exec: async (message) => {
		const data = await parseMessage(message, characters);
		if (!data) return;
		const result = await sendRequest(message, data);
		if (!result) return;

		await message.channel.send({
			content: `>>> ${message.member}\n**Character:** ${result.character}\n**Emotions:** ${result.emotions}\n**Text:** ${result.line}`,
			files: [result.file],
		});
		fs.unlink(result.file).catch((error) => console.log('Failed to delete temp file: \n', error));
	},
};
