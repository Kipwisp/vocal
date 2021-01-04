/* eslint-disable no-continue */
/* eslint-disable no-return-assign */
const bent = require('bent');
const fs = require('fs').promises;

const CHARACTER_CODE_LENGTH = 3;
const EMOTION_CODE_LENGTH = 1;
const SOURCE_FILTER = [
    'Super Smash Bros. Ultimate', 'Fallout: New Vegas', 'Undertale', 'Celeste',
];
const CHARACTER_FILTER = ['Chell', 'Stanley', 'Gordon Freeman'];

async function getSourceFile() {
    let get = bent('https://15.ai/', 'GET', 'string', {
        Host: '15.ai',
        'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/74.0',
        'Access-Control-Allow-Origin': '*',
    });
    let result = await get();

    const sourceCode = result.match(RegExp('/js/app\\.[0-9abcdef]+\\.js'));

    get = bent(`https://15.ai${sourceCode[0]}`, 'GET', 'string', {
        Host: '15.ai',
        'User-Agent': 'Mozilla/5.0 (X11; Linux i686; rv:10.0) Gecko/20100101 Firefox/74.0',
        'Access-Control-Allow-Origin': '*',
    });
    result = await get();

    return result;
}

async function extractResources() {
    const result = await getSourceFile();
    const filter = /["[\]]/g;

    const emotionsFound = result.match(RegExp('emotions:\\["[A-Z][A-Za-z, ]+"\\]', 'g')).slice(0, -1);
    const emotions = [];
    emotionsFound.forEach((x) => emotions.push(x.split(':')[1].replace(filter, '').split(',')));
    console.log(`Found ${emotions.length} character emotions.`);

    const charactersFound = [...result.matchAll(RegExp('name:"[A-Z][\'A-Za-z0-9 ]+"', 'g'))];
    const characters = {};
    charactersFound.slice(0, emotions.length).forEach((x) => characters[x[0].split(':')[1].replace(filter, '')] = x.index);
    console.log(`Found ${Object.keys(characters).length} characters.`);

    const sourcesFound = [...result.matchAll(RegExp('"?[A-Z0-9][A-Za-z0-9.\\- :]+"?:\\[', 'g'))];
    const sources = {};
    for (let i = 0; i < sourcesFound.length; ++i) {
        const range = (i === sourcesFound.length - 1) ? { min: sourcesFound[i].index, max: result.length } : { min: sourcesFound[i].index, max: sourcesFound[i + 1].index };
        sources[sourcesFound[i][0].replace(filter, '').slice(0, -1)] = range;
    }
    console.log(`Found ${sourcesFound.length} sources.`);

    return [characters, emotions, sources];
}

function createKey(name, codeLength, codes) {
    const nameSplit = name.toLowerCase().split(' ');
    let key = nameSplit[0].substr(0, codeLength);

    while (key.length < codeLength) {
        key.append('a');
    }
    if (key in codes) {
        if (nameSplit.length !== 1) {
            key = nameSplit[1].substr(0, codeLength);
        }
        let i = 0;
        while (key in codes) {
            key = key.substr(0, i) + key.charAt(i).toUpperCase() + key.substr(i + 1);
            i++;
        }
    }

    return key;
}

async function generateCodes() {
    const [characters, emotions, sources] = await extractResources();
    const warning = Object.keys(characters).length !== emotions.length;

    const characterCodes = {};
    const emotionNames = new Set();
    for (const [character, index] of Object.entries(characters)) {
        if (CHARACTER_FILTER.includes(character)) {
            emotions.pop();
            continue;
        }

        let source = '';
        for (const [key, value] of Object.entries(sources)) {
            if (value.min <= index && index < value.max) {
                source = key;
            }
        }

        if (SOURCE_FILTER.includes(source)) {
            emotions.pop();
            continue;
        }

        const key = createKey(character, CHARACTER_CODE_LENGTH, characterCodes);

        characterCodes[key] = {};
        characterCodes[key].name = character;

        const characterEmotions = emotions.pop();
        characterEmotions.forEach((emotion) => emotionNames.add(emotion));
        characterCodes[key].emotions = characterEmotions;
    }

    console.log(characterCodes);

    const emotionCodes = {};
    for (const emotion of emotionNames) {
        const key = createKey(emotion, EMOTION_CODE_LENGTH, emotionCodes);
        emotionCodes[key] = emotion;
    }

    console.log(emotionCodes);

    if (warning) {
        console.log('WARNING: The number of character emotions do not match the number of characters!');
    }

    return [characterCodes, emotionCodes];
}

async function writeCodes() {
    const [characterCodes, emotionCodes] = await generateCodes();
    fs.writeFile('resources/characters.json', JSON.stringify(characterCodes, null, 4));
    fs.writeFile('resources/emotions.json', JSON.stringify(emotionCodes, null, 4));
    console.log('Saved generated codes to resources directory.');
}

writeCodes();
