const config = require("../config.json");

module.exports = {  
    name: 'invite',
    command: new RegExp(`^${config.prefix}invite$`),
    exec: async (message) => { 
        message.reply(`https://discordapp.com/api/oauth2/authorize?client_id=${config.client_id}&permissions=34816&scope=bot`);
    }
};
