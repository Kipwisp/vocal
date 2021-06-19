const converter = require('number-to-words');
const config = require('../config.json');

function repairText(text) {
	const filteredText = text.trim().replace(/[^A-Za-z -.,!?|[\]{}']/gi, '');
	const lastChar = filteredText[filteredText.length - 1];

	return ['.', ',', ':', '!', '?'].includes(lastChar)
		? filteredText
		: `${filteredText}.`;
}

function convertNumbers(text) {
	let result = text;
	const numbers = [...text.matchAll(new RegExp('[0-9]+', 'g'))];
	for (const number of numbers) {
		result = result.replace(number[0], converter.toWords(Number(number[0])));
	}
	return result;
}

async function parseMessage(message, characters) {
	const code = message.content.substring(config.prefix.length, message.content.indexOf(' '));
	const characterCodeLength = Object.keys(characters)[0].length;

	const character = code.substr(0, characterCodeLength);
	if (!(character in characters)) {
		await message.channel.send(`${message.member} That character code is invalid. Say ${config.prefix}help to view valid codes.`);
		return null;
	}
	const characterName = characters[character].name;

	let text = convertNumbers(message.content.substr(message.content.indexOf(' ') + 1));
	text = repairText(text);
	if (text.length > config.char_limit) {
		const difference = text.length - config.char_limit;
		await message.channel.send(`${message.member} Your message is ${difference} character${difference === 1 ? '' : 's'} over the character limit (${config.char_limit} characters max).`);
		return null;
	}

	return {
		text,
		character: characterName,
		code,
	};
}

async function parseMessages(messages, characters, selectedCharacters) {
	let characterList = [...Object.values(characters)];
	const memberCharacters = {};
	const result = [];

	for (const message of messages) {
		const member = message.member.id;
		if (!(member in memberCharacters)) {
			let nextCharacter = null;

			if (selectedCharacters.length > 0) {
				nextCharacter = selectedCharacters.splice(0, 1)[0];
				characterList.filter((element) => element.name !== nextCharacter.name);
			} else {
				const randomCharacter = characterList.splice(Math.floor(Math.random() * characterList.length), 1)[0];
				nextCharacter = {
					name: randomCharacter.name,
				};

				if (characterList.length === 0) {
					characterList = [...Object.values(characters)];
				}
			}

			memberCharacters[member] = nextCharacter;
		}

		let parsedText = convertNumbers(message.content);
		parsedText = repairText(parsedText);

		if (parsedText.length <= 1) {
			return null;
		}

		const data = {
			text: parsedText,
			character: memberCharacters[member].name,
			member: message.member,
		};

		result.push(data);
	}

	return result;
}

module.exports = { parseMessage, parseMessages };
