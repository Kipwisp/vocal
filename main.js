const fs = require('fs');
const prompt = require('prompt-sync');

function setUp() {
	const tmpDir = 'tmp';
	if (!fs.existsSync(tmpDir)) {
		fs.mkdirSync(tmpDir);
		console.log('SETUP: creating `tmp` directory...');
	}

	const auth = 'auth.json';
	if (!fs.existsSync(auth)) {
		console.log('SETUP: Creating `auth.json`...');
		const input = prompt({ sigint: true });
		const tokenID = input('What is the token ID for your bot? >');
		const clientID = input('What is the client ID for your bot? >');

		const result = JSON.stringify({
			token: tokenID,
			client_id: clientID,
		});

		fs.writeFileSync(auth, result);
	}
}

function run() {
	setUp();

	// eslint-disable-next-line global-require
	const Vocal = require('./src/vocal');
	const bot = new Vocal();
	bot.start();
}

run();
