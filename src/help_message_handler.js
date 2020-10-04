const characters = require('../resources/characters.json');
const emotions = require('../resources/emotions.json');

const charactersPerPage = 10;
const maxPages = Math.ceil(Object.keys(characters).length / charactersPerPage);
const LEFT_ARROW = '⬅️';
const RIGHT_ARROW = '➡️';

class HelpMessageHandler {
    generateHelpMessage(page) {
        let helpMessage = '>>> Powered by 15.ai\n\n**Commands**:\n';

        // eslint-disable-next-line global-require
        const commands = require('./commands');
        for (const command of commands.commands) {
            if (command.name !== 'Help') {
                helpMessage += `**${command.name}** (${command.format}): ${command.description}\n`;
            }
        }

        helpMessage += `\n**Character codes and emotions** (Page **${page}** of ${maxPages}):\n`;

        const characterKeys = Object.keys(characters);
        const selectedCharacters = characterKeys.slice((page - 1) * charactersPerPage, page * charactersPerPage);
        for (const character of selectedCharacters) {
            helpMessage += `**${character}**: ${characters[character].name} \nEmotions: `;

            const characterEmotions = characters[character].emotions;
            helpMessage += `${characterEmotions[0]} (default)`;
            for (let i = 1; i < characterEmotions.length; ++i) {
                helpMessage += `, ${characterEmotions[i]}`;
            }
            helpMessage += '\n\n';
        }

        helpMessage += '**Emotion codes**:\n';
        for (const emotion of Object.keys(emotions)) {
            helpMessage += `**${emotion}**: ${emotions[emotion]} \n`;
        }

        return helpMessage;
    }

    async updateHelpMessage(message, page, reactions) {
        const newPage = (reactions.has(LEFT_ARROW)) ? page - 1 : page + 1;
        const newHelpMessage = this.generateHelpMessage(newPage);

        message.edit(newHelpMessage);
        this.collectReactions(message, newPage);
    }

    async collectReactions(sentMessage, page) {
        const options = [];
        if (page !== 1) {
            options.push(LEFT_ARROW);
        }
        if (page !== maxPages) {
            options.push(RIGHT_ARROW);
        }

        const filter = (reaction) => reaction.count !== 1 && options.includes(reaction.emoji.name);
        const collected = await sentMessage.awaitReactions(filter, { max: 1 });
        this.updateHelpMessage(sentMessage, page, collected);
    }
}

module.exports = HelpMessageHandler;
