const Discord = require('discord.js');
const fs = require('fs');
const config = require('../config.json');
const commands = require('./commands');
const notifications = require('../resources/notifications');
const resources = require('./resource_fetcher');

class Vocal {
	async setActivity(client) {
		console.log(`Logged in as ${client.user.tag}! \n`);
		try {
			await client.user.setActivity(notifications.notifyActivity(config.prefix));
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

		client.login(resources.auth.token);
	}
}

module.exports = Vocal;
