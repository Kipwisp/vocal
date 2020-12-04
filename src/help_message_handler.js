const config = require('../config.json');
const characters = require('../resources/characters.json');
const emotions = require('../resources/emotions.json');

const TTL = config.help_ttl;
const charactersPerPage = 10;
const maxPages = Math.ceil(Object.keys(characters).length / charactersPerPage);
const LEFT_ARROW = '⬅️';
const RIGHT_ARROW = '➡️';
const TERMINATED = '❌';

function generateHelpMessage(page) {
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

async function collectReactions(sentMessage, page) {
    const options = [];

    if (page !== 1) {
        options.push(LEFT_ARROW);
    }
    if (page !== maxPages) {
        options.push(RIGHT_ARROW);
    }

    const filter = (reaction) => reaction.count !== 1 && options.includes(reaction.emoji.name);
    const collected = await sentMessage.awaitReactions(filter, { max: 1, idle: TTL });

    if (collected.size === 0) {
        sentMessage.react(TERMINATED);
        return null;
    }

    return collected;
}

function updateHelpMessage(message, page, reactions) {
    const newPage = (reactions.has(LEFT_ARROW)) ? page - 1 : page + 1;
    const newHelpMessage = generateHelpMessage(newPage);

    message.edit(newHelpMessage);
    return newPage;
}

async function sendHelpMessage(message) {
    let page = 1;

    const helpMessage = generateHelpMessage(page);
    const sentMessage = await message.channel.send(helpMessage);

    await sentMessage.react(LEFT_ARROW);
    await sentMessage.react(RIGHT_ARROW);

    let collected = [];
    while (collected) {
        // eslint-disable-next-line no-await-in-loop
        collected = await collectReactions(sentMessage, page);

        if (collected) {
            // eslint-disable-next-line no-await-in-loop
            page = updateHelpMessage(sentMessage, page, collected);
        }
    }
}

module.exports = sendHelpMessage;
