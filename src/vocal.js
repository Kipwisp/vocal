const Discord = require('discord.js');
const config = require('../config.json');
const auth = require('../auth.json');
const commands = require('./commands');

class Vocal {
	async setActivity(client) {
		console.log(`Logged in as ${client.user.tag}! \n`);
		try {
			await client.user.setActivity(`${config.prefix}help | Powered by 15.ai`, { type: 'WATCHING' });
		} catch (error) {
			console.log('Failed to set activity: ', error);
		}
	}

	async handleMessage(message) {
		if (message.author.bot) return;
		if (!message.content.startsWith(config.prefix)) return;

		for (const command of commands.commands) {
			if (message.content.match(command.command)) {
				command.exec(message);
				break;
			}
		}
	}

	start() {
		const client = new Discord.Client();
		client.on('ready', async () => { this.setActivity(client); });
		client.on('message', async (message) => { this.handleMessage(message); });
		client.login(auth.token);
	}
}

module.exports = Vocal;
