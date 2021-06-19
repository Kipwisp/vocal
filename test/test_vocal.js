/* eslint-disable no-undef */
const assert = require('assert');
const mock = require('./mock');
const Vocal = require('../src/vocal');
const config = require('../config.json');

describe('#handleMessage(message)', () => {
  beforeEach(() => {
    vocal = new Vocal();
    mockChannel = new mock.MockTextChannel();
    mockVoice = new mock.MockVoice();
    mockMember = new mock.MockMember(mockVoice);
  });

  it('Should not reply to bot messages', async () => {
    const content = `${config.prefix}help`;
    const mockAuthor = new mock.MockAuthor(true);
    const mockMessage = new mock.MockMessage(mockChannel, mockMember, mockAuthor, content);

    vocal.handleMessage(mockMessage);

    assert(mockChannel.send.notCalled);
  });

  it('Should not reply if the message does not begin with the prefix', async () => {
    const content = 'help';
    const mockAuthor = new mock.MockAuthor(false);
    const mockMessage = new mock.MockMessage(mockChannel, mockMember, mockAuthor, content);

    vocal.handleMessage(mockMessage);

    assert(mockChannel.send.notCalled);
  });

  it('Should not reply to invalid commands', async () => {
    const content = `${config.prefix}command`;
    const mockAuthor = new mock.MockAuthor(false);
    const mockMessage = new mock.MockMessage(mockChannel, mockMember, mockAuthor, content);

    vocal.handleMessage(mockMessage);

    assert(mockChannel.send.notCalled);
  });

  it('Should reply to the invite command', async () => {
    const content = `${config.prefix}invite`;
    const mockAuthor = new mock.MockAuthor(false);
    const mockMessage = new mock.MockMessage(mockChannel, mockMember, mockAuthor, content);

    vocal.handleMessage(mockMessage);

    assert(mockChannel.send.calledOnce);
  });

  it('Should not execute the voice join command if the user is not in a voice channel and should send an appropriate response', async () => {
    const content = `${config.prefix}twi+ Test.`;
    const mockAuthor = new mock.MockAuthor(false);
    const mockMessage = new mock.MockMessage(mockChannel, mockMember, mockAuthor, content);

    vocal.handleMessage(mockMessage);

    assert(mockChannel.send.calledWith(`${mockMessage.member} Please join a voice channel before using that command.`));
  });
});
