class QueueHandler {
    constructor(callback) {
        this.guilds = {};
        this.callback = callback;
    }

    async play(guildID) {
        const guild = this.guilds[guildID];
        const request = guild.queue.shift();

        request.channel.send(`Now playing: [${request.character} - ${request.emotion}] ${request.line} | Requested by ${request.member}`);
        const dispatcher = guild.connection.play(request.file);
        dispatcher.on('speaking', (speaking) => {
            this.callback(guildID, request, speaking);
        });

        return dispatcher;
    }

    async startPlaying(guildID, voiceChannel) {
        const guild = this.guilds[guildID];

        if (guild.playing) return;

        guild.playing = true;
        guild.connection = await voiceChannel.join();

        this.play(guildID);
    }

    async finishPlaying(guildID) {
        const guild = this.guilds[guildID];

        if (guild.queue.length > 0) {
            this.play(guildID);
        } else {
            guild.playing = false;
            guild.connection.channel.leave();
        }
    }

    async addToQueue(guildID, request) {
        if (!this.guilds[guildID]) this.guilds[guildID] = { queue: [], playing: false, connection: null };
        const guild = this.guilds[guildID];

        guild.queue.push(request);

        if (guild.playing) {
            request.channel.send(`${request.member} Queued your request: [${request.character} - ${request.emotion}] ${request.line}`);
        }
    }
}

module.exports = QueueHandler;
