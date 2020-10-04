const config = require('../../config.json');
const HelpMessageHandler = require('../help_message_handler.js');

const helpMessageHandler = new HelpMessageHandler();
const LEFT_ARROW = '⬅️';
const RIGHT_ARROW = '➡️';

module.exports = {
    name: 'Help',
    command: new RegExp(`^${config.prefix}help$`),
    format: `${config.prefix}help`,
    description: 'Sends a help message containing commands for the bot and the pages for character codes.',
    exec: async (message) => {
        const page = 1;

        const helpMessage = helpMessageHandler.generateHelpMessage(page);
        const sentMessage = await message.channel.send(helpMessage);

        await sentMessage.react(LEFT_ARROW);
        await sentMessage.react(RIGHT_ARROW);
        helpMessageHandler.collectReactions(sentMessage, page);
    },
};
