/* eslint-disable no-undef */
const assert = require('assert');
const mock = require('./mock');
const GuildQueue = require('../src/guild_queue.js');

describe('#add(request, voiceChannel)', () => {
    beforeEach(() => {
        mockChannel = new mock.MockTextChannel(null);
        mockVoiceChannel = new mock.MockVoiceChannel();
        mockMember = new mock.MockMember();
        queue = new GuildQueue();
    });

    it('Should add one request to the queue when the queue is empty', async () => {
        const request = {
            line: 'Test', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };

        queue._add(request, mockVoiceChannel);

        assert.equal(queue.queue.length, 1);
    });

    it('Should add one request to the queue and send a message when the bot is currently in a voice channel', async () => {
        const request = {
            line: 'Test', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };

        queue.queue = ['Another test'];
        queue.connection = new mock.MockConnection();

        queue._add(request, mockVoiceChannel);

        assert.equal(queue.queue.length, 2);
        assert(mockChannel.send.calledOnce);
    });
});

describe('#play()', () => {
    beforeEach(() => {
        mockChannel = new mock.MockTextChannel(null);
        mockVoiceChannel = new mock.MockVoiceChannel();
        mockConnection = new mock.MockConnection(mockVoiceChannel);
        queue = new GuildQueue();
    });

    it('Should remove the next request in the queue, play the file, and send a message', async () => {
        const request = {
            line: 'Test', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        queue.queue = [request];
        queue.connection = mockConnection;

        const dispatcher = queue.play();

        assert.equal(queue.queue.length, 0);
        assert(mockConnection.play.calledOnce);
        assert(mockChannel.send.calledOnce);
        assert(dispatcher.on.calledOnce);
    });

    it('Should remove the next request in the queue, play the file, and send a message while preserving the queue order', async () => {
        const request1 = {
            line: 'Test', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        const request2 = {
            line: 'Still Testing', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        const request3 = {
            line: 'More Tests', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        queue.queue = [request1, request2, request3];
        queue.connection = mockConnection;

        const dispatcher = queue.play();

        assert.equal(queue.queue.length, 2);
        assert.equal(queue.queue[0], request2);
        assert(mockConnection.play.calledOnce);
        assert(mockChannel.send.calledOnce);
        assert(dispatcher.on.calledOnce);
    });
});

describe('#finishPlaying()', () => {
    beforeEach(() => {
        mockVoiceChannel = new mock.MockVoiceChannel();
        mockConnection = new mock.MockConnection(mockVoiceChannel);
        queue = new GuildQueue();
    });

    it('Should leave the channel if the queue is empty', async () => {
        queue.queue = [];
        queue.connection = mockConnection;

        queue._finishPlaying();

        assert(mockConnection.disconnect.calledOnce);
    });

    it('Should not leave the channel if the queue is not empty', async () => {
        const request = {
            line: 'Test', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        queue.queue = [request];
        queue.connection = mockConnection;

        queue._finishPlaying();

        assert(mockConnection.disconnect.notCalled);
    });
});
