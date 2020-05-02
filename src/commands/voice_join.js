const fs = require('fs').promises;
const helper = require('../get_voice_file.js');
const config = require('../../config.json');

const DELAY = 2000;

let queue = {};
let playing = {};

async function play(connection, guildID) {
    let guildQueue = queue[guildID];
    let request = guildQueue.shift();
    
    dispatcher = connection.play(request['file']);
    dispatcher.on('speaking', speaking => { 
        if (!speaking) {
            fs.unlink(request['file']).catch(error => console.log("Failed to delete temp file: \n", error));

            setTimeout(() => { 
                if (guildQueue.length > 0) {
                    play(connection, guildID);
                } else {
                    playing[guildID] = false;
                    connection.channel.leave();
                }
            }, DELAY);
        }
    });
}

async function addToQueue(request, voiceChannel, guildID) {
    if (!queue[guildID]) queue[guildID] = [];
    
    queue[guildID].push(request);
    
    if (playing[guildID]) return;

    playing[guildID] = true;
    let connection = await voiceChannel.join();
    return connection;
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

        let connection = await addToQueue(result, voiceChannel, message.guild.id);

        if (connection) {
            message.channel.send(`Now playing: [${result['character']} - ${result['emotion']}] ${result['line']} | Requested by ${result['member']}`);
            play(connection, message.guild.id);
        } else {
            message.channel.send(`${message.member} Queued your request: [${result['character']} - ${result['emotion']}] ${result['line']}`);
        }
    }
};