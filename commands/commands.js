const voice_file = require("./voice_file.js");
const voice_join = require("./voice_join.js");
const help = require("./help.js");
const invite = require("./invite.js");

module.exports = {  
    commands: [voice_file, voice_join, help, invite]
};