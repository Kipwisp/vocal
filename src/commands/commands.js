const voiceFile = require('./voice_file.js');
const voiceJoin = require('./voice_join.js');
const help = require('./help.js');
const invite = require('./invite.js');

module.exports = {
    commands: [voiceFile, voiceJoin, help, invite],
};
