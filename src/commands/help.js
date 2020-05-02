const characters = require('../../resources/characters.json');
const emotions = require('../../resources/emotions.json');
const config = require('../../config.json');

const name = 'Help';

module.exports = {
    name,
    command: new RegExp(`^${config.prefix}help$`),
    format: `${config.prefix}help`,
    description: 'Sends a help message containing commands for the bot and character codes.',
    exec: async (message) => {
        let helpMessage = '```Powered by 15.ai\n\nCommands:\n';

        // eslint-disable-next-line global-require
        const commands = require('./commands.js');
        for (const command of commands.commands) {
            if (command.name !== name) {
                helpMessage += `${command.name} (${command.format}): ${command.description}\n`;
            }
        }

        helpMessage += '\nCharacter codes and emotions:\n';
        for (const character of Object.keys(characters)) {
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
