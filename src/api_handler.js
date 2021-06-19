/* eslint-disable no-await-in-loop */
const bent = require('bent');
const crypto = require('crypto');
const fs = require('fs').promises;
const emojis = require('../resources/emojis');

const API = 'https://api.15.ai/app/getAudioFile4';
const post = bent(API, 'POST', 'json', {
  Host: 'api.15.ai',
  'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/74.0',
  'Access-Control-Allow-Origin': '*',
});
const getFile = bent('GET', 'buffer');
const FILE_NAME_LIMIT = 50;
const RANDOM_BYTES = 4;
const MAX_ATTEMPTS = 3;
const NUM_EMOTIONS = 5;

async function getStatus() {
  let status;
  try {
    const response = await post('', { character: 'Twilight Sparkle', text: 'Test.', emotion: 'Contextual' });
    status = response.statusCode;
  } catch (error) {
    status = error.statusCode;
  }

  return status !== 404;
}

async function getResponse(data) {
  const params = data;
  params.use_diagonal = true;
  params.emotion = 'Contextual';

  for (let i = 0; i < MAX_ATTEMPTS; ++i) {
    try {
      const response = await post('', params);

      console.log('Retrieved data successfully.');
      console.log('Processing data...');

      const waveFile = response.wavNames[0];
      const fileURL = `https://cdn.15.ai/audio/${waveFile}`;

      // If we try to access the file too soon, we might get a forbidden error
      await new Promise((r) => setTimeout(r, 1000));

      const voice = await getFile(fileURL);
      const emotions = response.torchmoji.splice(2, NUM_EMOTIONS).map((x) => emojis[x]).join(' ');

      return {
        voice,
        emotions,
      };
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

  await fs.writeFile(file, response.voice);
  console.log('Finished processing.');

  return {
    file,
    character: data.character,
    line: data.text,
    member: message.member,
    channel: message.channel,
    emotions: response.emotions,
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
    results.push(fs.writeFile(fileName, response.voice));
  }

  await Promise.all(results);
  return files;
}

module.exports = { sendRequest, sendRequests, getStatus };
