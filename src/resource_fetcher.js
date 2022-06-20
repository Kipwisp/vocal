const fs = require('fs');

const authResource = 'auth.json';
const auth = fs.existsSync(authResource) ? JSON.parse(fs.readFileSync(authResource)) : {};

const charactersResource = 'resources/characters.json';
const characters = fs.existsSync(charactersResource) ? JSON.parse(fs.readFileSync(charactersResource)) : {};

module.exports = { auth, characters };
