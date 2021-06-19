const config = require('../../config.json');
const sendHelpMessage = require('../help_message_handler');

module.exports = {
	name: 'Help',
	command: new RegExp(`^${config.prefix}help$`),
	format: `${config.prefix}help`,
	description: 'Sends a help message containing commands for the bot and the pages for character and emotion codes.',
	exec: async (message) => {
		sendHelpMessage(message);
	},
};
