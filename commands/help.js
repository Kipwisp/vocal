const characters = require("../resources/characters.json")
const config = require("../config.json");

module.exports = {  
    name: 'help',
    command: new RegExp(`^${config.prefix}help$`),
    exec: async (message) => { 
        let helpMessage = `\`\`\`Usage: ${config.prefix}xx message \nCharacter codes: \n`;
        for (character in characters) {
            helpMessage += `${character}: ${characters[character]} \n`;
        }
        message.reply(`${helpMessage}\`\`\``);
    }
};