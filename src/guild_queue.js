const fs = require('fs').promises;
const Mutex = require('async-mutex').Mutex;
const DELAY = 2000;
const DISCONNECTED = 4;

class GuildQueue {
    constructor() {
        this.queue = [];
        this.connection = null;
        this.mutex = new Mutex();
    }

    play() {
        const request = this.queue.shift();

        request.channel.send(`Now playing: [${request.character} - ${request.emotions}] ${request.line} | Requested by ${request.member}`);
        const dispatcher = this.connection.play(request.file);
        dispatcher.on('speaking', (speaking) => {
            this.speakingCallback(request, speaking);
        });

        return dispatcher;
    }

    speakingCallback(request, speaking) {
        if (!speaking) {
            fs.unlink(request.file).catch((error) => console.log('Failed to delete temp file: \n', error));
            setTimeout(() => {
                this.finishPlaying()
            }, DELAY);
        }
    }

    async finishPlaying() {
        await this.mutex.runExclusive(async () => {
            await this._finishPlaying();
        });
    }

    async _finishPlaying() {
        if (this.queue.length > 0) {
            this.play();
        } else {
            this.connection.disconnect();
        }
    }

    async join(voiceChannel) {
        try {
            this.connection = await voiceChannel.join();
            this.play();
        } catch (error) {
            console.log('Failed to connect to voice channel: \n', error);
            this.connection = null;
        }
    }

    async add(request, voiceChannel) {
        await this.mutex.runExclusive(async () => {
            await this._add(request, voiceChannel);
        });
    }

    async _add(request, voiceChannel) {
        this.queue.push(request);

        if (this.connection === null || this.connection?.status === DISCONNECTED) {
            await this.join(voiceChannel);
        } else {
            request.channel.send(`${request.member} Queued your request: [${request.character} - ${request.emotions}] ${request.line}`);
        }
    }
}

module.exports = GuildQueue;