const getStatus = require('../api_handler').getStatus;
const config = require('../../config.json');

module.exports = {
	name: 'Status',
	command: new RegExp(`^${config.prefix}status`),
	format: `${config.prefix}status`,
	description: 'Checks the current status of the 15.ai API.',
	exec: async (message) => {
		const isAlive = await getStatus();

		if (isAlive) {
			message.channel.send(`>>> ${message.member}\n15.ai API Status: **ONLINE** ✅`);
		} else {
			message.channel.send(`>>> ${message.member}\n15.ai API Status: **OFFLINE** ❌`);
		}
	},
};
