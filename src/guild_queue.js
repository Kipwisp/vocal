const fs = require('fs').promises;
const DELAY = 2000;
const DISCONNECTED = 4;

class GuildQueue {
    constructor() {
        this.queue = [];
        this.connection = null;
    }

    play() {
        const request = this.queue.shift();

        request.channel.send(`Now playing: [${request.character} - ${request.emotions}] ${request.line} | Requested by ${request.member}`);
        const dispatcher = this.connection.play(request.file);
        dispatcher.on('speaking', (speaking) => {
            this.finish(request, speaking);
        });

        return dispatcher;
    }

    async join(voiceChannel) {
        try {
            this.connection = -1;
            this.connection = await voiceChannel.join();
            this.play();
        } catch (error) {
            console.log('Failed to connect to voice channel: \n', error);
            voiceChannel.leave();
            this.connection = null;
        }
    }

    finish(request, speaking) {
        if (!speaking) {
            fs.unlink(request.file).catch((error) => console.log('Failed to delete temp file: \n', error));
            setTimeout(() => {
                this.next()
            }, DELAY);
        }
    }

    next() {
        if (this.queue.length > 0) {
            this.play();
        } else {
            this.connection.disconnect();
        }
    }

    add(request, voiceChannel) {
        this.queue.push(request);

        if (this.connection === null || this.connection?.status === DISCONNECTED) {
            this.join(voiceChannel);
        } else {
            request.channel.send(`${request.member} Queued your request: [${request.character} - ${request.emotions}] ${request.line}`);
        }
    }
}

module.exports = GuildQueue;