const bent = require('bent');
const crypto = require('crypto');
const fs = require('fs').promises;

const post = bent('https://api.15.ai/app/getAudioFile', 'POST', 'buffer', {
    Host: 'api.15.ai',
    'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/74.0',
    'Access-Control-Allow-Origin': '*',
});
const FILE_NAME_LIMIT = 50;
const RANDOM_BYTES = 4;
const MAX_ATTEMPTS = 3;

async function getResponse(data) {
    const params = data;

    for (let i = 0; i < MAX_ATTEMPTS; ++i) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const response = await post('', params);

            console.log('Retrieved data successfully.');
            console.log('Processing data...');
            return response;
        } catch (error) {
            console.log('An error occurred: \n', error);
        }
    }

    return null;
}

async function sendRequest(message, data) {
    const sentMessage = await message.channel.send(`${message.member} Hold on, this might take a bit...`);
    const file = `tmp/${data.code}_${data.text.replace(/[^A-Z0-9 _']/gi, '').substr(0, FILE_NAME_LIMIT)}_${crypto.randomBytes(RANDOM_BYTES).toString('hex')}.wav`;

    console.log('Sending request...');
    const response = await getResponse(data);
    sentMessage.delete();

    if (!response) {
        await message.channel.send(`${message.member} Sorry, your request failed. Try again.`);
        return null;
    }

    await fs.writeFile(file, response);
    console.log('Finished processing.');

    return {
        file,
        character: data.character,
        emotion: data.emotion,
        line: data.text,
        member: message.member,
        channel: message.channel,
    };
}

async function getResponses(datum) {
    const results = [];
    for (const data of datum) {
        results.push(getResponse(data));
    }

    return Promise.all(results);
}

async function sendRequests(requests) {
    console.log('Sending requests...');
    const responses = await getResponses(requests);

    if (responses.includes(null)) {
        return null;
    }

    const files = [];
    const results = [];
    for (const response of responses) {
        const fileName = `tmp/${crypto.randomBytes(RANDOM_BYTES).toString('hex')}.wav`;
        files.push(fileName);
        results.push(fs.writeFile(fileName, response));
    }

    await Promise.all(results);
    return files;
}

module.exports = { sendRequest, sendRequests };
