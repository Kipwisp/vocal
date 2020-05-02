const sinon = require('sinon');

class MockChannel {
    constructor() {
        this.send_message = sinon.fake();
    }

    // eslint-disable-next-line no-unused-vars
    async send(text) {
        this.send_message();
    }
}

module.exports = MockChannel;
