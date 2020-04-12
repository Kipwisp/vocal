const fs = require('fs').promises;
const helper = require('../helper.js');
const config = require("../config.json");

module.exports = {  
    name: 'Voice File',
    command: new RegExp(`^${config.prefix}[a-z][a-z] `),
    format: `${config.prefix}xx message`,
    description: 'Sends a .wav file of the generated voice for the selected character and message.',
    exec: async (message) => { 
        let file = await helper.getVoiceFile(message);
        if (!file) { return; }

        try {
            await message.reply({ files: [file] });
            fs.unlink(file).catch(error => console.log("Failed to delete temp file: \n", error));
        } catch (error) {
            console.log("An error occurred: \n", error);
        }
    }
};