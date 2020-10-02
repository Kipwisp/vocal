const characters = require('../../resources/characters.json');
const emotions = require('../../resources/emotions.json');
const config = require('../../config.json');

const name = 'Help';
const charactersPerPage = 10;
const maxPages = Math.ceil(Object.keys(characters).length / charactersPerPage);

module.exports = {
    name,
    command: new RegExp(`^${config.prefix}help( [1-${maxPages}])?$`),
    format: `${config.prefix}help n`,
    description: 'Sends a help message containing commands for the bot and the n page for character codes.',
    exec: async (message) => {
        const page = message.content.substr(config.prefix.length + 5, 1);
        let helpMessage = '```Powered by 15.ai\n\nCommands:\n';

        // eslint-disable-next-line global-require
        const commands = require('.');
        for (const command of commands.commands) {
            if (command.name !== name) {
                helpMessage += `${command.name} (${command.format}): ${command.description}\n`;
            }
        }

        if (page === '') {
            helpMessage += `\nSay '${config.prefix}help n' to view nth (1-${maxPages}) page for characters and emotions.`;
            message.channel.send(`${message.member} ${helpMessage}\`\`\``);
            return;
        }

        helpMessage += `\nCharacter codes and emotions (Page ${page} of ${maxPages}):\n`;

        const characterKeys = Object.keys(characters);
        const selectedCharacters = characterKeys.slice((page - 1) * charactersPerPage, page * charactersPerPage);
        for (const character of selectedCharacters) {
            helpMessage += `${character}: ${characters[character].name} \nEmotions: `;

            const characterEmotions = characters[character].emotions;
            helpMessage += `${characterEmotions[0]} (default)`;
            for (let i = 1; i < characterEmotions.length; ++i) {
                helpMessage += `, ${characterEmotions[i]}`;
            }
            helpMessage += '\n\n';
        }

        helpMessage += 'Emotion codes:\n';
        for (const emotion of Object.keys(emotions)) {
            helpMessage += `${emotion}: ${emotions[emotion]} \n`;
        }

        message.channel.send(`${message.member} ${helpMessage}\`\`\``);
    },
};
