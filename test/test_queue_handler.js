/* eslint-disable no-undef */
const assert = require('assert');
const sinon = require('sinon');
const mock = require('./mock');
const QueueHandler = require('../src/queue_handler.js');

describe('#addToQueue(guildID, request)', () => {
    beforeEach(() => {
        mockChannel = new mock.MockChannel();
        mockMember = new mock.MockMember();
        callback = sinon.fake();
        queueHandler = new QueueHandler(callback);
    });

    it('Should add one request to the queue when the queue is empty', async () => {
        const request = {
            line: 'Test', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        const guildID = 1;

        queueHandler.addToQueue(guildID, request);

        assert.equal(queueHandler.guilds[guildID].queue.length, 1);
    });

    it('Should add one request to the queue and send a message when the queue is not empty', async () => {
        const request = {
            line: 'Test', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        const guildID = 1;
        queueHandler.guilds = { 1: { queue: ['Another test'], playing: true } };

        queueHandler.addToQueue(guildID, request);

        assert.equal(queueHandler.guilds[guildID].queue.length, 2);
        assert(mockChannel.send.calledOnce);
    });

    it('Should add one request to the queue even when another guild\'s queue is not empty', async () => {
        const request = {
            line: 'Test', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        const guildID = 1;
        queueHandler.guilds = { 2: { queue: ['Another test'], playing: true } };

        queueHandler.addToQueue(guildID, request);

        assert.equal(queueHandler.guilds[guildID].queue.length, 1);
    });
});

describe('#play(guildID)', () => {
    beforeEach(() => {
        mockChannel = new mock.MockChannel();
        mockVoiceChannel = new mock.MockVoiceChannel();
        mockConnection = new mock.MockConnection(mockVoiceChannel);
        callback = sinon.fake();
        queueHandler = new QueueHandler(callback);
    });

    it('Should remove the next request in the queue, play the file, send a message, and set the callback', async () => {
        const guildID = 1;
        const request = {
            line: 'Test', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        queueHandler.guilds = { 1: { queue: [request], playing: true, connection: mockConnection } };

        const dispatcher = await queueHandler.play(guildID);

        assert.equal(queueHandler.guilds[guildID].queue.length, 0);
        assert(mockConnection.play.calledOnce);
        assert(mockChannel.send.calledOnce);
        assert(dispatcher.on.calledOnce);
    });

    it('Should remove the next request in the queue, play the file, send a message, and set the callback while preserving the queue order', async () => {
        const guildID = 1;
        const request1 = {
            line: 'Test', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        const request2 = {
            line: 'Still Testing', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        const request3 = {
            line: 'More Tests', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        queueHandler.guilds = { 1: { queue: [request1, request2, request3], playing: true, connection: mockConnection } };

        const dispatcher = await queueHandler.play(guildID);

        assert.equal(queueHandler.guilds[guildID].queue.length, 2);
        assert.equal(queueHandler.guilds[guildID].queue[0], request2);
        assert(mockConnection.play.calledOnce);
        assert(mockChannel.send.calledOnce);
        assert(dispatcher.on.calledOnce);
    });
});

describe('#startPlaying(guildID, voiceChannel)', () => {
    beforeEach(() => {
        mockVoiceChannel = new mock.MockVoiceChannel();
        mockConnection = new mock.MockConnection(mockVoiceChannel);
        callback = sinon.fake();
        queueHandler = new QueueHandler(callback);
    });

    it('Should join the voice channel and start playing if it is not currently playing for the guild', async () => {
        const guildID = 1;
        const request = {
            line: 'Test', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        queueHandler.guilds = { 1: { queue: [request], playing: false, connection: null } };

        queueHandler.startPlaying(guildID, mockVoiceChannel);

        assert(queueHandler.guilds[guildID].playing);
        assert(mockVoiceChannel.join.calledOnce);
    });

    it('Should not do anything if it is currently playing for the guild', async () => {
        const guildID = 1;
        queueHandler.guilds = { 1: { queue: [], playing: true, connection: mockConnection } };

        queueHandler.startPlaying(guildID, mockVoiceChannel);

        assert(queueHandler.guilds[guildID].playing);
        assert(mockVoiceChannel.join.notCalled);
    });
});

describe('#finishPlaying(guildID)', () => {
    beforeEach(() => {
        mockVoiceChannel = new mock.MockVoiceChannel();
        mockConnection = new mock.MockConnection(mockVoiceChannel);
        callback = sinon.fake();
        queueHandler = new QueueHandler(callback);
    });

    it('Should leave the channel if the queue is empty', async () => {
        const guildID = 1;
        queueHandler.guilds = { 1: { queue: [], playing: true, connection: mockConnection } };

        queueHandler.finishPlaying(guildID);

        assert(!queueHandler.guilds[guildID].playing);
        assert(mockConnection.play.notCalled);
        assert(mockVoiceChannel.leave.calledOnce);
    });

    it('Should play the next request if the queue is not empty', async () => {
        const guildID = 1;
        const request = {
            line: 'Test', emotion: 'Test', character: 'Test', channel: mockChannel, member: mockMember,
        };
        queueHandler.guilds = { 1: { queue: [request], playing: true, connection: mockConnection } };

        queueHandler.finishPlaying(guildID);

        assert(queueHandler.guilds[guildID].playing);
        assert(mockConnection.play.calledOnce);
        assert(mockVoiceChannel.leave.notCalled);
    });
});
