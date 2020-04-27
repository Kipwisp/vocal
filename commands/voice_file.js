const fs = require('fs').promises;
const helper = require('../helper.js');
const config = require("../config.json");

module.exports = {  
    name: 'Voice File',
    command: new RegExp(`^${config.prefix}[a-z][a-z][a-zA-Z]? `),
    format: `${config.prefix}xxy message`,
    description: 'Sends a .wav file of the generated voice for the selected character, emotion (optional), and message.',
    exec: async (message) => { 
        let result = await helper.getVoiceFile(message);
        if (!result) return;
        let file = result["file"];

        try {
            await message.channel.send({ content: `${message.member}`, files: [file] });
            fs.unlink(file).catch(error => console.log("Failed to delete temp file: \n", error));
        } catch (error) {
            console.log("An error occurred: \n", error);
        }
    }
};