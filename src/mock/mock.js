const sinon = require('sinon');

/* Mock objects for unit testing */

class MockMessage {
    channel;
    member;
    content;
    author;

    constructor(channel, member, content) {
        this.channel = channel;
        this.member = member;
        this.content = content;
    }

    setAuthor(author) {
        this.author = author;
    }
}

class MockMember {
    name;

    constructor() {
        this.name = 'Tester';
    }

    toString() {
        return this.name;
    }
}

class MockAuthor {
    bot;

    constructor(bot) {
        this.bot = bot;
    }
}

class MockChannel {
    send_message;

    constructor() {
        this.send_message = sinon.fake();
    }

    async send(text) {
        this.send_message();
    }
}

module.exports.MockMessage = MockMessage; 
module.exports.MockMember = MockMember;
module.exports.MockAuthor = MockAuthor;
module.exports.MockChannel = MockChannel;