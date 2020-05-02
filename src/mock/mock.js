/* eslint-disable max-classes-per-file */
const sinon = require('sinon');

/* Mock objects for unit testing */

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

class MockMember {
    constructor() {
        this.name = 'Tester';
    }

    toString() {
        return this.name;
    }
}

class MockAuthor {
    constructor(bot) {
        this.bot = bot;
    }
}

class MockChannel {
    constructor() {
        this.send_message = sinon.fake();
    }

    // eslint-disable-next-line no-unused-vars
    async send(text) {
        this.send_message();
    }
}

module.exports.MockMessage = MockMessage;
module.exports.MockMember = MockMember;
module.exports.MockAuthor = MockAuthor;
module.exports.MockChannel = MockChannel;
