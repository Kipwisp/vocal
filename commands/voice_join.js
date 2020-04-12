const fs = require('fs').promises;
const helper = require("../helper.js");
const config = require("../config.json");

let queue = {};
let playing = {};

async function play(connection, message) {
    let guildID = message.guild.id;
    let guildQueue = queue[guildID];
    let file = guildQueue.shift();
    
    message.channel.send(`Now playing: ${file}`);
    dispatcher = connection.play(file);
    dispatcher.on("speaking", speaking => { 
        if (!speaking) {
            fs.unlink(file).catch(error => console.log("Failed to delete temp file: \n", error));

            if (guildQueue.length > 0) {
                play(connection, message);
            } else {
                playing[guildID] = false;
                connection.channel.leave();
            }
        }
    });
}

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
        if (!file) return;

        let guildID = message.guild.id;
        if (!queue[guildID]) queue[guildID] = [];
        
        queue[guildID].push(file);
       
        if (!playing[guildID]) {
            playing[guildID] = true;
            let connection = await voiceChannel.join();
            play(connection, message);
        } else {
            message.reply(`Queued your request: ${file}`);
        }
    }
};