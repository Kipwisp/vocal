class MockMessage {
    channel;
    member;
    content;

    constructor(channel, member, content) {
        this.channel = channel;
        this.member = member;
        this.content = content;
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

class MockChannel {
    async send(text) {
        return true;
    }
}

module.exports.MockMessage = MockMessage; 
module.exports.MockMember = MockMember;
module.exports.MockChannel = MockChannel;