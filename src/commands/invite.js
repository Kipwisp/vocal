const config = require('../../config.json');
const resources = require('../resource_fetcher');

module.exports = {
	name: 'Invite',
	command: new RegExp(`^${config.prefix}invite$`),
	format: `${config.prefix}invite`,
	description: 'Sends the invite link for this bot.',
	exec: async (message) => {
		message.channel.send(`${message.member} https://discordapp.com/api/oauth2/authorize?client_id=${resources.auth.client_id}&permissions=3180544&scope=bot`);
	},
};
