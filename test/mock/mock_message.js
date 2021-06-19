class MockMessage {
	constructor(channel, member, author, content) {
		this.channel = channel;
		this.member = member;
		this.author = author;
		this.content = content;
	}
}

module.exports = MockMessage;
