const sinon = require('sinon');
const MockConnection = require('./mock_connection');

class MockVoiceChannel {
	constructor() {
		this.join = sinon.fake.returns(new MockConnection());
		this.leave = sinon.fake();
	}
}

module.exports = MockVoiceChannel;
