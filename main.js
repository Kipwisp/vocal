const fs = require('fs');
const prompt = require('prompt-sync');
const generateCodes = require('./src/generate_codes');

async function setUp() {
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

	const characters = 'resources/characters.json';
	if (!fs.existsSync(characters)) {
		console.log('SETUP: Creating `characters.json`...');
		await generateCodes();
	}
}

async function run() {
	await setUp();

	// eslint-disable-next-line global-require
	const Vocal = require('./src/vocal');
	const bot = new Vocal();
	bot.start();
}

run();
