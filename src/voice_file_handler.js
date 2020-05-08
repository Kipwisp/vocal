const bent = require('bent');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
const config = require('../config.json');

const post = bent('https://api.fifteen.ai/app/getAudioFile', 'POST', 'buffer', {
    Host: 'api.fifteen.ai',
    'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/74.0',
    'Access-Control-Allow-Origin': '*',
    Origin: 'https://fifteen.ai',
    Referer: 'https://fifteen.ai/app',
});
const FILE_NAME_LIMIT = 50;
const RANDOM_BYTES = 4;
const MAX_ATTEMPTS = 3;
const MAX_CHARS = 1300;

class VoiceFileHandler {
    constructor(characters, emotions) {
        this.characters = characters;
        this.emotions = emotions;
    }

    parseText(text) {
        const filteredText = text.replace(/[^A-Z _.,!?:']/gi, '').substr(0, config.char_limit);
        const lastChar = filteredText[filteredText.length - 1];

        return ['.', ',', ':', '!', '?'].includes(lastChar)
            ? filteredText
            : `${filteredText}.`;
    }

    async parseMessage(message) {
        const code = message.content.substring(config.prefix.length, message.content.indexOf(' '));

        const character = code.substr(0, 2);
        if (!(character in this.characters)) {
            await message.channel.send(`${message.member} That character code is invalid. Say ${config.prefix}help to view valid codes.`);
            return null;
        }
        const characterName = this.characters[character].name;

        let emotionName;
        const characterEmotions = this.characters[character].emotions;
        if (code.match(RegExp('[a-z][a-z][a-zA-Z]\\+?$'))) {
            const emotion = code.substr(2, 1);
            if (!(emotion in this.emotions)) {
                await message.channel.send(`${message.member} That emotion code is invalid. Say ${config.prefix}help to view valid codes.`);
                return null;
            }
            emotionName = this.emotions[emotion];

            if (!characterEmotions.includes(emotionName)) {
                await message.channel.send(`${message.member} That character does not have that emotion. Say ${config.prefix}help to view valid character emotions.`);
                return null;
            }
        } else {
            emotionName = characterEmotions[0];
        }

        const text = this.parseText(message.content.substr(message.content.indexOf(' ') + 1));
        if (text.length > config.char_limit) {
            const difference = text.length - config.char_limit;
            await message.channel.send(`${message.member} Your message is ${difference} character${difference === 1 ? '' : 's'} over the character limit (${config.char_limit} characters max).`);
            return null;
        }

        return {
            text, character: characterName, emotion: emotionName, code,
        };
    }

    async getResponse(data, attempts) {
        try {
            const response = await post('', data);
            console.log('Retrieved data successfully.');
            console.log('Processing data...');

            return response;
        } catch (error) {
            console.log('An error occurred: \n', error);

            const attemptsLeft = attempts - 1;
            if (attemptsLeft > 0) {
                console.log(`Attempts left: ${attemptsLeft} | Trying again...`);
                return this.getResponse(data, attemptsLeft);
            }

            return null;
        }
    }

    async getVoiceFile(message) {
        const data = await this.parseMessage(message);
        if (!data) return null;

        const sentMessage = await message.channel.send(`${message.member} Hold on, this might take a bit...`);
        const file = `tmp/${data.code}_${data.text.replace(/[^A-Z _']/gi, '').substr(0, FILE_NAME_LIMIT)}_${crypto.randomBytes(RANDOM_BYTES).toString('hex')}.wav`;

        console.log('Sending request...');
        const response = await this.getResponse(data, MAX_ATTEMPTS);
        sentMessage.delete();

        if (!response) {
            await message.channel.send(`${message.member} Sorry, your request failed. Try again.`);
            return null;
        }

        await fs.writeFile(file, response);
        console.log('Finished processing.');

        return {
            file,
            character: data.character,
            emotion: data.emotion,
            line: data.text,
            member: message.member,
            channel: message.channel,
        };
    }

    async getMessages(message, amount) {
        const messageHandler = message.channel.messages;

        const messages = [];
        let previousMessage = message;
        for (let i = 0; i < amount; ++i) {
            // eslint-disable-next-line no-await-in-loop
            previousMessage = (await messageHandler.fetch({ before: previousMessage.id, limit: 1 })).values().next().value;

            if (!previousMessage) {
                break;
            }

            if (previousMessage.author.bot) {
                --i;
            } else {
                messages.unshift(previousMessage);
            }
        }

        return messages;
    }

    extractArguments(message) {
        const amount = message.content.substr(message.content.indexOf(' ') + 1, 1);

        const selectedCharacters = [];
        const codes = message.content.matchAll(new RegExp('-[a-z][a-z][a-zA-Z]?', 'g'));
        for (const code of codes) {
            const characterCode = code[0].substr(1, 2);
            const emotionCode = code[0].substr(3, 1);

            if (characterCode in this.characters) {
                selectedCharacters.push({
                    name: this.characters[characterCode].name,
                    emotion: ((emotionCode in this.emotions && this.characters[characterCode].emotions.includes(this.emotions[emotionCode])))
                        ? this.emotions[emotionCode] : this.characters[characterCode].emotions[0],
                });
            }
        }

        return { amount, selectedCharacters };
    }

    async parseMessages(messages, selectedCharacters) {
        let characterList = [...Object.values(this.characters)];
        const memberCharacters = {};
        const result = [];
        let charTotal = 0;

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
                        emotion: randomCharacter.emotions[Math.floor(Math.random() * randomCharacter.emotions.length)],
                    };

                    if (characterList.length === 0) {
                        characterList = [...Object.values(this.characters)];
                    }
                }

                memberCharacters[member] = nextCharacter;
            }

            const parsedText = this.parseText(message.content);
            charTotal += parsedText.length;
            if (parsedText.length <= 1) {
                return null;
            }
            const data = { text: parsedText, character: memberCharacters[member].name, emotion: memberCharacters[member].emotion };
            result.push(data);
        }

        return { result, charTotal };
    }

    async getResponses(datum) {
        const results = [];
        for (const data of datum) {
            results.push(this.getResponse(data, MAX_ATTEMPTS));
        }

        return Promise.all(results);
    }

    async sendDubVoiceFile(message) {
        const sentMessage = await message.channel.send(`${message.member} Hold on, this might take a bit...`);
        const args = this.extractArguments(message);
        const messages = await this.getMessages(message, args.amount);

        const data = await this.parseMessages(messages, args.selectedCharacters);
        if (data.charTotal > MAX_CHARS) {
            sentMessage.delete();
            message.channel.send(`${message.member} Sorry, the selected messages may result in a file that is too large to send.`);
            return;
        }
        if (!data.result) {
            sentMessage.delete();
            message.channel.send(`${message.member} Sorry, one of the selected messages contains invalid input.`);
            return;
        }

        console.log('Sending requests...');
        const responses = await this.getResponses(data.result);

        if (responses.includes(null)) {
            sentMessage.delete();
            message.channel.send(`${message.member} Sorry, your request failed. Try again.`);
            return;
        }

        const files = [];
        const results = [];
        for (const response of responses) {
            const fileName = `tmp/${crypto.randomBytes(RANDOM_BYTES).toString('hex')}.wav`;
            files.push(fileName);
            results.push(fs.writeFile(fileName, response));
        }

        await Promise.all(results);

        const combinedFiles = ffmpeg(files[0]);
        for (let i = 1; i < files.length; ++i) {
            combinedFiles.input('resources/audio/spacing.wav').input(files[i]);
        }

        const result = `tmp/voicedub_${args.amount}_${crypto.randomBytes(RANDOM_BYTES).toString('hex')}.wav`;

        combinedFiles.on('error', (error) => {
            console.log('Failed to merge files:', error);

            sentMessage.delete();
            message.channel.send(`${message.member} Sorry, your request failed. Try again.`);

            for (const file of files) {
                fs.unlink(file).catch((err) => console.log('Failed to delete temp file: \n', err));
            }
        }).on('end', () => {
            console.log('Merging finished.');

            sentMessage.delete();
            message.channel.send({ content: `${message.member}`, files: [result] }).then(() => {
                fs.unlink(result).catch((error) => console.log('Failed to delete temp file: \n', error));
            });

            for (const file of files) {
                fs.unlink(file).catch((error) => console.log('Failed to delete temp file: \n', error));
            }
        }).mergeToFile(result, 'tmp');
    }
}

module.exports = VoiceFileHandler;
