class MockMember {
    constructor(voice) {
        this.name = 'Tester';
        this.voice = voice;
    }

    toString() {
        return this.name;
    }
}

module.exports = MockMember;
