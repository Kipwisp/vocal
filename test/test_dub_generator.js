/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
const assert = require('assert');
const sinon = require('sinon');
const mock = require('./mock');
const extractArguments = require('../src/dub_generator')._extractArguments;
const config = require('../config.json');

const characters = {
	ts: { name: 'Twilight Sparkle' },
	gl: { name: 'GLaDOS' },
};

const resources = require('../src/resource_fetcher');

sinon.stub(resources, 'characters').value(characters);
sinon.stub(resources, 'codeLength').value(2);

describe('#extractArguments(message)', () => {
	beforeEach(() => {
		mockChannel = new mock.MockTextChannel();
		mockMember = new mock.MockMember();
	});

	it('Should extract the number of messages', async () => {
		const content = `${config.prefix}voicedub 5`;
		const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

		const result = await extractArguments(mockMessage);

		assert.equal(result.amount, 5);
	});

	it('Should extract the number of messages and the selected character', async () => {
		const content = `${config.prefix}voicedub 5 -ts`;
		const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

		const result = await extractArguments(mockMessage);

		assert.equal(result.amount, 5);
		assert.deepEqual(result.selectedCharacters, [{
			name: 'Twilight Sparkle',
		}]);
	});

	it('Should extract the number of messages and the selected characters', async () => {
		const content = `${config.prefix}voicedub 5 -ts -gl`;
		const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

		const result = await extractArguments(mockMessage);

		assert.equal(result.amount, 5);
		assert.deepEqual(result.selectedCharacters, [{
			name: 'Twilight Sparkle',
		}, {
			name: 'GLaDOS',
		}]);
	});

	it('Should extract the number of messages and ignore invalid character codes', async () => {
		const content = `${config.prefix}voicedub 5 -xx`;
		const mockMessage = new mock.MockMessage(mockChannel, mockMember, null, content);

		const result = await extractArguments(mockMessage);

		assert.equal(result.amount, 5);
		assert.deepEqual(result.selectedCharacters, []);
	});
});
