const sinon = require('sinon');

class MockChannel {
    constructor() {
        this.send = sinon.fake();
    }
}

module.exports = MockChannel;
