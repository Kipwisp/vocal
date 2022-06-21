const fs = require('fs').promises;
const ffmpeg = require('fluent-ffmpeg');
const crypto = require('crypto');
const sendRequests = require('./api_handler').sendRequests;
const parseMessages = require('./message_parser').parseMessages;
const notifications = require('../resources/notifications');
const resources = require('./resource_fetcher');

const MAX_CHARS = 1300;
const RANDOM_BYTES = 4;

async function getMessages(message, amount) {
	const messageHandler = message.channel.messages;
	const messages = await messageHandler.fetch({ before: message.id, limit: amount });

	return [...messages.values()].reverse();
}

function extractArguments(message) {
	const amount = message.content.substr(message.content.indexOf(' ') + 1, 1);

	const selectedCharacters = [];
	const codes = message.content.matchAll(new RegExp(`-[a-zA-Z]{${resources.codeLength}}`, 'g'));
	for (const code of codes) {
		const characterCode = code[0].substr(1, resources.codeLength);

		if (characterCode in resources.characters) {
			selectedCharacters.push({
				name: resources.characters[characterCode].name,
			});
		}
	}

	return { amount, selectedCharacters };
}

function createCastingCredits(data) {
	let credits = '>>> __**STARRING**__ \n';
	const members = [];

	for (const role of data) {
		if (!members.includes(role.member)) {
			credits += `${role.member} as *${role.character}*\n`;
			members.push(role.member);
		}
	}

	return credits;
}

async function sendDub(message) {
	const sentMessage = await message.channel.send(notifications.notifyProcessing(message.member));
	const args = extractArguments(message);
	const messages = await getMessages(message, args.amount);

	const data = await parseMessages(messages, args.selectedCharacters);

	if (!data) {
		sentMessage.delete();
		message.channel.send(notifications.notifyError(message.member));
		return;
	}

	let charTotal = 0;
	for (const result of data) {
		charTotal += result.text.length;
	}

	if (charTotal > MAX_CHARS) {
		sentMessage.delete();
		message.channel.send(notifications.notifySizeLimitExceeded(message.member));
		return;
	}

	const files = await sendRequests(data);

	if (files == null) {
		sentMessage.delete();
		message.channel.send(notifications.notifyError(message.member));
		return;
	}

	const combinedFiles = ffmpeg(files[0]);
	for (let i = 1; i < files.length; ++i) {
		combinedFiles.input('resources/audio/spacing.wav').input(files[i]);
	}

	const result = `tmp/voicedub_${args.amount}_${crypto.randomBytes(RANDOM_BYTES).toString('hex')}.wav`;

	combinedFiles.on('error', (error) => {
		console.log('Failed to merge files:', error);

		sentMessage.delete();
		message.channel.send(notifications.notifyError(message.member));

		for (const file of files) {
			fs.unlink(file).catch((err) => console.log('Failed to delete temp file: \n', err));
		}
	}).on('end', async () => {
		console.log('Merging finished.');
		sentMessage.delete();

		const credits = createCastingCredits(data);

		message.channel.send({ content: `${message.member}\n${credits}`, files: [result] }).then(() => {
			fs.unlink(result).catch((error) => console.log('Failed to delete temp file: \n', error));
		});

		for (const file of files) {
			fs.unlink(file).catch((error) => console.log('Failed to delete temp file: \n', error));
		}
	}).mergeToFile(result, 'tmp');
}

module.exports = { sendDub, _extractArguments: extractArguments };
