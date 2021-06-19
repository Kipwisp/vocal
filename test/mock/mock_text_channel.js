const sinon = require('sinon');

class MockTextChannel {
  constructor() {
    this.send = sinon.fake();
  }
}

module.exports = MockTextChannel;
