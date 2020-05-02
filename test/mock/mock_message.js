class MockMessage {
    constructor(channel, member, content) {
        this.channel = channel;
        this.member = member;
        this.content = content;
    }

    setAuthor(author) {
        this.author = author;
    }
}

module.exports = MockMessage;
