const fs = require('fs').promises;
const helper = require('../get_voice_file.js');
const config = require('../../config.json');

let queue = {};
let playing = {};

async function play(connection, message) {
    let guildID = message.guild.id;
    let guildQueue = queue[guildID];
    let request = guildQueue.shift();
    
    message.channel.send(`Now playing: [${request['character']} - ${request['emotion']}] ${request['line']} | Requested by ${request['member']}`);
    dispatcher = connection.play(request['file']);
    dispatcher.on('speaking', speaking => { 
        if (!speaking) {
            let timeout = 2000;

            fs.unlink(request['file']).catch(error => console.log("Failed to delete temp file: \n", error));

            setTimeout(() => { 
                if (guildQueue.length > 0) {
                    play(connection, message);
                } else {
                    playing[guildID] = false;
                    connection.channel.leave();
                }
            }, timeout);
        }
    });
}

module.exports = {  
    name: 'Voice Join',
    command: new RegExp(`^${config.prefix}[a-z][a-z][a-zA-Z]?\\+ `),
    format: `${config.prefix}xxy+ message`,
    description: 'Joins the voice channel the user is in and plays the generated voice for the selected character, emotion (optional), and message.',
    exec: async (message) => { 
        let voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.channel.send(`${message.member} Please join a voice channel before using that command.`);
            return;
        }

        let result = await helper.getVoiceFile(message);
        if (!result) return;

        let guildID = message.guild.id;
        if (!queue[guildID]) queue[guildID] = [];
        
        queue[guildID].push(result);
       
        if (!playing[guildID]) {
            playing[guildID] = true;
            let connection = await voiceChannel.join();
            play(connection, message);
        } else {
            message.channel.send(`${message.member} Queued your request: [${result['character']} - ${result['emotion']}] ${result['line']}`);
        }
    }
};