const sinon = require('sinon');

class MockDispatcher {
	constructor() {
		this.on = sinon.fake();
	}
}

module.exports = MockDispatcher;
