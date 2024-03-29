const sendRequest = require('../api_handler').sendRequest;
const parseMessage = require('../message_parser').parseMessage;
const queueHandler = require('../queue_handler');
const config = require('../../config.json');
const resources = require('../resource_fetcher');

module.exports = {
	name: 'Voice Join',
	command: new RegExp(`^${config.prefix}[a-zA-Z]{${resources.codeLength}}\\+ `),
	format: `${config.prefix}${'x'.repeat(resources.codeLength)}+ message`,
	description: 'Joins the voice channel the user is in and plays the generated voice for the selected character and message.',
	exec: async (message) => {
		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel) {
			await message.channel.send(`${message.member} Please join a voice channel before using that command.`);
			return;
		}

		const data = await parseMessage(message);
		if (!data) return;

		const result = await sendRequest(message, data);
		if (!result) return;

		queueHandler.addRequest(message.guild.id, result, voiceChannel);
	},
};
