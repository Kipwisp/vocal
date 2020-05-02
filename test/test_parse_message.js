/* eslint-disable no-undef */
const assert = require('assert');
const mock = require('./mock');
const helper = require('../src/get_voice_file.js');
const config = require('../config.json');

describe('#parseMessage(message)', () => {
    beforeEach(() => {
        mockChannel = new mock.MockChannel();
        mockMember = new mock.MockMember();
    });

    it('Should return null when the character code is invalid', async () => {
        const content = `${config.prefix}xx Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        const result = await helper.parseMessage(mockMessage);

        assert.equal(result, null);
    });

    it('Should return null when the emotion code is invalid', async () => {
        const content = `${config.prefix}tsx Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        const result = await helper.parseMessage(mockMessage);

        assert.equal(result, null);
    });

    it('Should return null when a character does not have the specified emotion', async () => {
        const content = `${config.prefix}tsH Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        const result = await helper.parseMessage(mockMessage);

        assert.equal(result, null);
    });

    it('Should return null when the text is over the character limit', async () => {
        let content = `${config.prefix}ts `;
        for (i = 0; i < config.char_limit; ++i) { content += 'x'; }
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        const result = await helper.parseMessage(mockMessage);

        assert.equal(result, null);
    });

    it('Should return the extracted data for the specified character with the default emotion when no emotion is specified', async () => {
        const content = `${config.prefix}ts Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        const result = await helper.parseMessage(mockMessage);

        assert.equal(result.text, 'Testing.');
        assert.equal(result.character, 'Twilight Sparkle');
        assert.equal(result.emotion, 'Happy');
    });

    it('Should return the extracted data for the specified character with the specified emotion', async () => {
        const content = `${config.prefix}tsn Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        const result = await helper.parseMessage(mockMessage);

        assert.equal(result.text, 'Testing.');
        assert.equal(result.character, 'Twilight Sparkle');
        assert.equal(result.emotion, 'Neutral');
    });

    it('Should return the extracted data for the specified character with the specified emotion for voice join', async () => {
        const content = `${config.prefix}tsn+ Testing.`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        const result = await helper.parseMessage(mockMessage);

        assert.equal(result.text, 'Testing.');
        assert.equal(result.character, 'Twilight Sparkle');
        assert.equal(result.emotion, 'Neutral');
    });
});
