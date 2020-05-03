/* eslint-disable no-undef */
const assert = require('assert');
const mock = require('./mock');
const VoiceFileHandler = require('../src/voice_file_handler.js');
const config = require('../config.json');

const characters = {
    ts: { name: 'Twilight Sparkle', emotions: ['Happy', 'Neutral'] },
};
const emotions = {
    h: 'Happy',
    n: 'Neutral',
    H: 'Homicidal',
};

describe('#parseMessage(message)', () => {
    beforeEach(() => {
        voiceFileHandler = new VoiceFileHandler(characters, emotions);
        mockChannel = new mock.MockChannel();
        mockMember = new mock.MockMember();
    });

    it('Should return null when the character code is invalid and send an appropriate response', async () => {
        const content = `${config.prefix}xx Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert.equal(result, null);
        assert(mockChannel.send.calledWith(`${mockMessage.member} That character code is invalid. Say ${config.prefix}help to view valid codes.`));
    });

    it('Should return null when the emotion code is invalid and send an appropriate response', async () => {
        const content = `${config.prefix}tsx Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert.equal(result, null);
        assert(mockChannel.send.calledWith(`${mockMessage.member} That emotion code is invalid. Say ${config.prefix}help to view valid codes.`));
    });

    it('Should return null when a character does not have the specified emotion and send an appropriate response', async () => {
        const content = `${config.prefix}tsH Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert.equal(result, null);
        assert(mockChannel.send.calledWith(`${mockMessage.member} That character does not have that emotion. Say ${config.prefix}help to view valid character emotions.`));
    });

    it('Should return null when the text is over the character limit and send an appropriate response', async () => {
        let content = `${config.prefix}ts `;
        for (i = 0; i < config.char_limit; ++i) { content += 'x'; }
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert.equal(result, null);
        assert(mockChannel.send.calledWith(`${mockMessage.member} Your message is 1 character over the character limit (${config.char_limit} characters max).`));
    });

    it('Should return the extracted data for the specified character with the default emotion when no emotion is specified', async () => {
        const content = `${config.prefix}ts Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert.equal(result.text, 'Testing.');
        assert.equal(result.character, 'Twilight Sparkle');
        assert.equal(result.emotion, 'Happy');
    });

    it('Should return the extracted data for the specified character with the specified emotion', async () => {
        const content = `${config.prefix}tsn Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert.equal(result.text, 'Testing.');
        assert.equal(result.character, 'Twilight Sparkle');
        assert.equal(result.emotion, 'Neutral');
    });

    it('Should return the extracted data for the specified character with the specified emotion for voice join', async () => {
        const content = `${config.prefix}tsn+ Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await voiceFileHandler.parseMessage(mockMessage);

        assert.equal(result.text, 'Testing.');
        assert.equal(result.character, 'Twilight Sparkle');
        assert.equal(result.emotion, 'Neutral');
    });
});
