const sinon = require('sinon');
const MockDispatcher = require('./mock_dispatcher.js')

class MockConnection {
    constructor(channel) {
        this.channel = channel;
        this.play = sinon.fake.returns(new MockDispatcher());
    }
}

module.exports = MockConnection;