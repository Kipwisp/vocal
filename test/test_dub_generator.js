/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
const assert = require('assert');
const mock = require('./mock');
const extractArguments = require('../src/dub_generator.js')._extractArguments;
const config = require('../config.json');

const characters = {
    ts: { name: 'Twilight Sparkle', emotions: ['Happy', 'Neutral'] },
    gl: { name: 'GLaDOS', emotions: ['Neutral', 'Homicidal'] },
};
const emotions = {
    h: 'Happy',
    n: 'Neutral',
    H: 'Homicidal',
};

describe('#extractArguments(message, characters, emotions)', () => {
    beforeEach(() => {
        mockChannel = new mock.MockTextChannel();
        mockMember = new mock.MockMember();
    });

    it('Should extract the number of messages', async () => {
        const content = `${config.prefix}voicedub 5`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await extractArguments(mockMessage, characters, emotions);

        assert.equal(result.amount, 5);
    });

    it('Should extract the number of messages and the selected character', async () => {
        const content = `${config.prefix}voicedub 5 -ts`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await extractArguments(mockMessage, characters, emotions);

        assert.equal(result.amount, 5);
        assert.deepEqual(result.selectedCharacters, [{
            name: 'Twilight Sparkle',
            emotion: 'Happy',
        }]);
    });

    it('Should extract the number of messages and the selected characters', async () => {
        const content = `${config.prefix}voicedub 5 -ts -gl`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await extractArguments(mockMessage, characters, emotions);

        assert.equal(result.amount, 5);
        assert.deepEqual(result.selectedCharacters, [{
            name: 'Twilight Sparkle',
            emotion: 'Happy',
        }, {
            name: 'GLaDOS',
            emotion: 'Neutral',
        }]);
    });

    it('Should extract the number of messages and the selected character and emotion', async () => {
        const content = `${config.prefix}voicedub 5 -tsn`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await extractArguments(mockMessage, characters, emotions);

        assert.equal(result.amount, 5);
        assert.deepEqual(result.selectedCharacters, [{
            name: 'Twilight Sparkle',
            emotion: 'Neutral',
        }]);
    });

    it('Should extract the number of messages and ignore invalid character codes', async () => {
        const content = `${config.prefix}voicedub 5 -xx`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await extractArguments(mockMessage, characters, emotions);

        assert.equal(result.amount, 5);
        assert.deepEqual(result.selectedCharacters, []);
    });

    it('Should extract the number of messages and the selected characters but select the default emotion for invalid character emotions', async () => {
        const content = `${config.prefix}voicedub 5 -tsH`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await extractArguments(mockMessage, characters, emotions);

        assert.equal(result.amount, 5);
        assert.deepEqual(result.selectedCharacters, [{
            name: 'Twilight Sparkle',
            emotion: 'Happy',
        }]);
    });

    it('Should extract the number of messages and the selected characters but select the default emotion for invalid emotion codes', async () => {
        const content = `${config.prefix}voicedub 5 -tsx`;
        const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

        const result = await extractArguments(mockMessage, characters, emotions);

        assert.equal(result.amount, 5);
        assert.deepEqual(result.selectedCharacters, [{
            name: 'Twilight Sparkle',
            emotion: 'Happy',
        }]);
    });
});
