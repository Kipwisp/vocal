const characters = require("../resources/characters.json");
const config = require("../config.json");

const name = 'Help';

module.exports = {  
    name: name,
    command: new RegExp(`^${config.prefix}help$`),
    format: `${config.prefix}help`,
    description: 'Sends a help message containing commands for the bot and character codes.',
    exec: async (message) => { 
        let helpMessage = `\`\`\`Powered by 15.ai\n\nCommands:\n`

        let commands = require("./commands.js");
        for (command of commands.commands) {
            if (command.name !== name) {
                helpMessage += `${command.name} (${command.format}): ${command.description}\n`;
            }
        }
        
        helpMessage += `\nCharacter codes:\n`;
        for (character in characters) {
            helpMessage += `${character}: ${characters[character]} \n`;
        }
        message.reply(`${helpMessage}\`\`\``);
    }
};