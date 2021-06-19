const voiceFile = require('./voice_file');
const voiceJoin = require('./voice_join');
const voiceDub = require('./voice_dub');
const help = require('./help');
const invite = require('./invite');
const status = require('./status');

module.exports = {
  commands: [voiceFile, voiceJoin, voiceDub, help, invite, status],
};
