/* eslint-disable no-undef */
const assert = require('assert');
const mock = require('../src/mock/mock.js');
const Vocal = require('../src/vocal.js');
const config = require('../config.json');

describe('#handleMessage(message)', () => {
    beforeEach(() => {
        vocal = new Vocal();
        mockChannel = new mock.MockChannel();
        mockMember = new mock.MockMember();
    });

    it('Should not reply if the author of the message is a bot', async () => {
        const content = `${config.prefix}help`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        const mockAuthor = new mock.MockAuthor(true);
        mockMessage.setAuthor(mockAuthor);

        vocal.handleMessage(mockMessage);

        assert(mockChannel.send_message.notCalled);
    });

    it('Should not reply if the message does not begin with the prefix', async () => {
        const content = 'help';
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        const mockAuthor = new mock.MockAuthor(true);
        mockMessage.setAuthor(mockAuthor);

        vocal.handleMessage(mockMessage);

        assert(mockChannel.send_message.notCalled);
    });

    it('Should reply to the help command', async () => {
        const content = `${config.prefix}help`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        const mockAuthor = new mock.MockAuthor(false);
        mockMessage.setAuthor(mockAuthor);

        vocal.handleMessage(mockMessage);

        assert(mockChannel.send_message.calledOnce);
    });

    it('Should reply to the invite command', async () => {
        const content = `${config.prefix}invite`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        const mockAuthor = new mock.MockAuthor(false);
        mockMessage.setAuthor(mockAuthor);

        vocal.handleMessage(mockMessage);

        assert(mockChannel.send_message.calledOnce);
    });
});
