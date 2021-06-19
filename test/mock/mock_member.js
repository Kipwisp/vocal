class MockMember {
  constructor(voice, id) {
    this.name = 'Tester';
    this.voice = voice;
    this.id = id;
  }

  toString() {
    return this.name;
  }
}

module.exports = MockMember;
