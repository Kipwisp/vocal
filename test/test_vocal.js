const mock = require('../src/mock/mock.js');
const Vocal = require('../src/vocal.js');
const config = require('../config.json');
const assert = require('assert');

describe('#handleMessage(message)', () => {
    beforeEach(() => {
        vocal = new Vocal();
        mockChannel = new mock.MockChannel();
        mockMember = new mock.MockMember();
    })

    it('Should not reply if the author of the message is a bot', async () => {
        let content = `${config.prefix}help`;
        let mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        let mockAuthor = new mock.MockAuthor(true);
        mockMessage.setAuthor(mockAuthor);
        
        vocal.handleMessage(mockMessage);

        assert(mockChannel.send_message.notCalled);
    });

    it('Should not reply if the message does not begin with the prefix', async () => {
        let content = `help`;
        let mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        let mockAuthor = new mock.MockAuthor(true);
        mockMessage.setAuthor(mockAuthor);

        vocal.handleMessage(mockMessage);

        assert(mockChannel.send_message.notCalled);
    });

    it('Should reply to the help command', async () => {
        let content = `${config.prefix}help`;
        let mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        let mockAuthor = new mock.MockAuthor(false);
        mockMessage.setAuthor(mockAuthor);

        vocal.handleMessage(mockMessage);

        assert(mockChannel.send_message.calledOnce);
    });

    it('Should reply to the invite command', async () => {
        let content = `${config.prefix}invite`;
        let mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        let mockAuthor = new mock.MockAuthor(false);
        mockMessage.setAuthor(mockAuthor);

        vocal.handleMessage(mockMessage);

        assert(mockChannel.send_message.calledOnce);
    });
});
