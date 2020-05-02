const mock = require('../src/mock/mock.js');
const helper = require('../src/get_voice_file.js');
const config = require('../config.json');
const assert = require('assert');

describe('#parseMessage(message)', () => {
    beforeEach(() => {
        mockChannel = new mock.MockChannel();
        mockMember = new mock.MockMember();
    })

    it('Should return null when the character code is invalid', async () => {
        let content = `${config.prefix}xx Testing.`;
        let mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        let result = await helper.parseMessage(mockMessage);

        assert.equal(result, null);
    });

    it('Should return null when the emotion code is invalid', async () => {
        let content = `${config.prefix}tsx Testing.`;
        let mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        let result = await helper.parseMessage(mockMessage);

        assert.equal(result, null);
    });

    it('Should return null when a character does not have the specified emotion', async () => {
        let content = `${config.prefix}tsH Testing.`;
        let mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        let result = await helper.parseMessage(mockMessage);

        assert.equal(result, null);
    });

    it('Should return null when the text is over the character limit', async () => {
        let content = `${config.prefix}ts `;
        for (i = 0; i < config.char_limit; ++i) { content += 'x'; }
        let mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        let result = await helper.parseMessage(mockMessage);

        assert.equal(result, null);
    });

    it('Should return the extracted data for the specified character with the default emotion when no emotion is specified', async () => {
        let content = `${config.prefix}ts Testing.`;
        let mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        let result = await helper.parseMessage(mockMessage);

        assert.equal(result['text'], 'Testing.');
        assert.equal(result['character'], 'Twilight Sparkle');
        assert.equal(result['emotion'], 'Happy');
    });

    it('Should return the extracted data for the specified character with the specified emotion', async () => {
        let content = `${config.prefix}tsn Testing.`;
        let mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        let result = await helper.parseMessage(mockMessage);

        assert.equal(result['text'], 'Testing.');
        assert.equal(result['character'], 'Twilight Sparkle');
        assert.equal(result['emotion'], 'Neutral');
    });

    it('Should return the extracted data for the specified character with the specified emotion for voice join', async () => {
        let content = `${config.prefix}tsn+ Testing.`;
        let mockMessage = new mock.MockMessage(mockChannel, mockMember, content);
        let result = await helper.parseMessage(mockMessage);

        assert.equal(result['text'], 'Testing.');
        assert.equal(result['character'], 'Twilight Sparkle');
        assert.equal(result['emotion'], 'Neutral');
    });
});
