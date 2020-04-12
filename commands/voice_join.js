const fs = require('fs').promises;
const helper = require("../helper.js");
const config = require("../config.json");

module.exports = {  
    name: 'Voice Join',
    command: new RegExp(`^${config.prefix}[a-z][a-z]\\+ `),
    format: `${config.prefix}xx+ message`,
    description: 'Joins the voice channel the user is in and plays the generated voice for the selected character and message.',
    exec: async (message) => { 
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.reply(`Please join a voice channel before using that command.`);
            return;
        }

        let file = await helper.getVoiceFile(message);
        if (!file) { return; }

        try {
            let connection = await voiceChannel.join();

            let dispatcher = connection.play(file);
            dispatcher.on("speaking", speaking => { 
                if (!speaking) {
                    setTimeout(() => { voiceChannel.leave(); }, 2000);
                    fs.unlink(file).catch(error => console.log("Failed to delete temp file: \n", error));
                }
            });
        } catch (error) {
            voiceChannel.leave();
            console.log("An error occurred: \n", error);
        }
    }
};