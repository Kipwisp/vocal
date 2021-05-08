const voiceFile = require('./voice_file.js');
const voiceJoin = require('./voice_join.js');
const voiceDub = require('./voice_dub.js');
const help = require('./help.js');
const invite = require('./invite.js');
const status = require('./status.js');

module.exports = {
    commands: [voiceFile, voiceJoin, voiceDub, help, invite, status],
};
