/* eslint-disable no-undef */
const assert = require('assert');
const mock = require('./mock');
const VoiceFileHandler = require('../src/voice_file_handler.js');
const config = require('../config.json');

const characters = {
    ts: { name: 'Twilight Sparkle', emotions: ['0.10', '0.20'] },
    gl: { name: 'GLaDOS', emotions: ['0.20', '0.30'] },
};

describe('#parseMessage(message)', () => {
    beforeEach(() => {
        voiceFileHandler = new VoiceFileHandler(characters);
        mockChannel = new mock.MockTextChannel(null);
        mockMember = new mock.MockMember();
    });

    it('Should return null when the character code is invalid and send an appropriate response', async () => {
        const content = `${config.prefix}xx Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert(!result);
        assert(mockChannel.send.calledWith(`${mockMessage.member} That character code is invalid. Say ${config.prefix}help to view valid codes.`));
    });

    it('Should return null when a character does not have the specified emotion and send an appropriate response', async () => {
        const content = `${config.prefix}ts0.30 Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert(!result);
        assert(mockChannel.send.calledWith(`${mockMessage.member} That character does not have that emotion. Say ${config.prefix}help to view valid character emotions.`));
    });

    it('Should return null when the text is over the character limit and send an appropriate response', async () => {
        let content = `${config.prefix}ts `;
        for (i = 0; i < config.char_limit; ++i) { content += 'x'; }
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert(!result);
        assert(mockChannel.send.calledWith(`${mockMessage.member} Your message is 1 character over the character limit (${config.char_limit} characters max).`));
    });

    it('Should return the extracted data for the specified character with the default emotion when no emotion is specified', async () => {
        const content = `${config.prefix}ts Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert.equal(result.parameters.text, 'Testing.');
        assert.equal(result.parameters.character, 'Twilight Sparkle');
        assert.equal(result.parameters.emotion, 'μ = 0.10');
    });

    it('Should return the extracted data for the specified character with the specified emotion', async () => {
        const content = `${config.prefix}ts0.20 Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert.equal(result.parameters.text, 'Testing.');
        assert.equal(result.parameters.character, 'Twilight Sparkle');
        assert.equal(result.parameters.emotion, 'μ = 0.20');
    });

    it('Should return the extracted data for the specified character with the specified emotion for voice join', async () => {
        const content = `${config.prefix}ts0.10+ Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert.equal(result.parameters.text, 'Testing.');
        assert.equal(result.parameters.character, 'Twilight Sparkle');
        assert.equal(result.parameters.emotion, 'μ = 0.10');
    });
});

describe('#extractArguments(message)', () => {
    beforeEach(() => {
        voiceFileHandler = new VoiceFileHandler(characters);
        mockChannel = new mock.MockTextChannel();
        mockMember = new mock.MockMember();
    });

    it('Should extract the number of messages', async () => {
        const content = `${config.prefix}voicedub 5`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.extractArguments(mockMessage);

        assert.equal(result.amount, 5);
    });

    it('Should extract the number of messages and the selected character', async () => {
        const content = `${config.prefix}voicedub 5 -ts`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.extractArguments(mockMessage);

        assert.equal(result.amount, 5);
        assert.deepEqual(result.selectedCharacters, [{
            name: 'Twilight Sparkle',
            emotion: '0.10',
        }]);
    });

    it('Should extract the number of messages and the selected characters', async () => {
        const content = `${config.prefix}voicedub 5 -ts -gl`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.extractArguments(mockMessage);

        assert.equal(result.amount, 5);
        assert.deepEqual(result.selectedCharacters, [{
            name: 'Twilight Sparkle',
            emotion: '0.10',
        }, {
            name: 'GLaDOS',
            emotion: '0.20',
        }]);
    });

    it('Should extract the number of messages and the selected character and emotion', async () => {
        const content = `${config.prefix}voicedub 5 -ts0.20`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.extractArguments(mockMessage);

        assert.equal(result.amount, 5);
        assert.deepEqual(result.selectedCharacters, [{
            name: 'Twilight Sparkle',
            emotion: '0.20',
        }]);
    });

    it('Should extract the number of messages and ignore invalid character codes', async () => {
        const content = `${config.prefix}voicedub 5 -xx`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.extractArguments(mockMessage);

        assert.equal(result.amount, 5);
        assert.deepEqual(result.selectedCharacters, []);
    });

    it('Should extract the number of messages and the selected characters but select the default emotion for invalid character emotions', async () => {
        const content = `${config.prefix}voicedub 5 -ts0.30`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.extractArguments(mockMessage);

        assert.equal(result.amount, 5);
        assert.deepEqual(result.selectedCharacters, [{
            name: 'Twilight Sparkle',
            emotion: '0.10',
        }]);
    });
});

describe('#parseMessages(messages, selectedCharacters)', () => {
    beforeEach(() => {
        voiceFileHandler = new VoiceFileHandler(characters);
        mockChannel = new mock.MockTextChannel();
        mockMember1 = new mock.MockMember(null, 1);
        mockMember2 = new mock.MockMember(null, 2);
        mockMember3 = new mock.MockMember(null, 3);
    });

    it('Should assign the same character and emotion to a member and extract the messages\' text', async () => {
        const message1 = new mock.MockMessage(mockChannel, mockMember1, null, 'Testing a.');
        const message2 = new mock.MockMessage(mockChannel, mockMember1, null, 'Testing b.');
        const messages = [message1, message2];
        const selectedCharacters = [];

        const result = await voiceFileHandler.parseMessages(messages, selectedCharacters);

        assert.equal(result[0].text, 'Testing a.');
        assert.equal(result[1].text, 'Testing b.');
        assert.equal(result[0].character, result[1].character);
        assert.equal(result[0].emotion, result[1].emotion);
    });

    it('Should assign different characters between members and extract the messages\' text', async () => {
        const message1 = new mock.MockMessage(mockChannel, mockMember1, null, 'Testing a.');
        const message2 = new mock.MockMessage(mockChannel, mockMember2, null, 'Testing b.');
        const messages = [message1, message2];
        const selectedCharacters = [];

        const result = await voiceFileHandler.parseMessages(messages, selectedCharacters);

        assert.equal(result[0].text, 'Testing a.');
        assert.equal(result[1].text, 'Testing b.');
        assert.notEqual(result[0].character, result[1].character);
    });

    it('Should use up the selected characters first', async () => {
        const message1 = new mock.MockMessage(mockChannel, mockMember1, null, 'Testing a.');
        const message2 = new mock.MockMessage(mockChannel, mockMember2, null, 'Testing b.');
        const messages = [message1, message2];
        const selectedCharacters = [{
            name: 'Fluttershy',
            emotion: '0.10',
        }, {
            name: 'Rarity',
            emotion: '0.20',
        }];

        const result = await voiceFileHandler.parseMessages(messages, selectedCharacters);

        assert.equal(result[0].character, 'Fluttershy');
        assert.equal(result[0].emotion, 'μ = 0.10');
        assert.equal(result[1].character, 'Rarity');
        assert.equal(result[1].emotion, 'μ = 0.20');
        assert.equal(selectedCharacters.length, 0);
    });

    it('Should use a random character after there are no more selected characters', async () => {
        const message1 = new mock.MockMessage(mockChannel, mockMember1, null, 'Testing a.');
        const message2 = new mock.MockMessage(mockChannel, mockMember2, null, 'Testing b.');
        const messages = [message1, message2];
        const selectedCharacters = [{
            name: 'Fluttershy',
            emotion: '0.10',
        }];

        const result = await voiceFileHandler.parseMessages(messages, selectedCharacters);

        assert.equal(result[0].character, 'Fluttershy');
        assert.equal(result[0].emotion, 'μ = 0.10');
        assert.notEqual(result[1].character, 'Fluttershy');
        assert.equal(selectedCharacters.length, 0);
    });

    it('Should return null if one the messages\' content contains invalid input', async () => {
        const message1 = new mock.MockMessage(mockChannel, mockMember1, null, 'Testing a.');
        const message2 = new mock.MockMessage(mockChannel, mockMember2, null, '.');
        const messages = [message1, message2];
        const selectedCharacters = [];

        const result = await voiceFileHandler.parseMessages(messages, selectedCharacters);

        assert(!result);
    });

    it('Should reset pool of characters after they have all been used up', async () => {
        const message1 = new mock.MockMessage(mockChannel, mockMember1, null, 'Testing a.');
        const message2 = new mock.MockMessage(mockChannel, mockMember2, null, 'Testing b.');
        const message3 = new mock.MockMessage(mockChannel, mockMember3, null, 'Testing c.');
        const messages = [message1, message2, message3];
        const selectedCharacters = [];

        const result = await voiceFileHandler.parseMessages(messages, selectedCharacters);
        assert(result);
    });
});
