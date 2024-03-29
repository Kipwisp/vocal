const Discord = require('discord.js');
const config = require('../config.json');
const commands = require('./commands');
const notifications = require('../resources/notifications');
const resources = require('./resource_fetcher');

class Vocal {
	async onReady(client) {
		console.log(`Logged in as ${client.user.tag}! \n`);
		this.setActivity(client);
		setInterval(async () => { this.setActivity(client); }, 3600000); // update activity every hour
	}

	async setActivity(client) {
		try {
			await client.user.setActivity(notifications.notifyActivity(config.prefix), { type: 'LISTENING' });
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
		client.on('ready', async () => { this.onReady(client); });
		client.on('message', async (message) => { this.handleMessage(message); });

		client.login(resources.auth.token);
	}
}

module.exports = Vocal;
