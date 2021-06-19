const GuildQueue = require('./guild_queue');

class QueueHandler {
  constructor() {
    this.guilds = {};
  }

  addRequest(guildID, request, voiceChannel) {
    if (!this.guilds[guildID]) this.guilds[guildID] = new GuildQueue();
    this.guilds[guildID].add(request, voiceChannel);
  }
}

const queueHandler = new QueueHandler();

module.exports = queueHandler;
