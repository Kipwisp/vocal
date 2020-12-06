# Vocal
Vocal is a Discord bot that utilizes fifteen's application to send generated voices from popular fictional characters upon user request. 
Be sure to check out fifteen's wonderful tool that makes this project possible. Their tool can be found at https://fifteen.ai/.

## Configuration
Configure the following values for the bot in config.json:
  * token: The unique token for your Discord bot
  * client_id: The client ID for your Discord bot
  * prefix: The prefix the bot looks for in a message in order to be activated
  * char_limit: The maximum number of characters allowed for a message, 200 is recommended
  * help_ttl: The amount of idle time in milliseconds before a help message expires

An example is shown here:
```
{ 
  "token": "XXXXXXXXXXXXXXXXXXXXXXXX.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "client_id": "000000000000000000",
  "prefix": "v!",
  "char_limit": 200,
  "help_ttl": 60000
}
```

## Setting up
Vocal runs on a Node.js server. If you do not have Node.js installed, install it [here](https://nodejs.org/en/download/).

To set up the bot, install the required dependencies for it with the following command:
```
npm install
```
Then run the script to automatically generate the character and emotion codes for the bot which will be saved to the resources directory:
```
npm run generate
```

## Running
Run the following command to start the bot:
```
npm run start
```
Upon the bot successfully logging into Discord, a message should appear stating "Logged in as [bot name]!" in the console.

## Testing
Run the following command to run the test suite for the bot:
```
npm test
```

## Commands
The bot has the following commands:

 * **\<prefix\>\<character code\>\<emotion code\> \<message\>** - The bot will reply with a .wav file of the requested voice.
 * **\<prefix\>\<character code\>\<emotion code\>+ \<message\>** - The bot will join the voice channel the user is in and play the requested voice.
 * **\<prefix\>voicedub n -\<character code\>\<emotion code\> -\<character code\>\<emotion code\> -\<character code\>\<emotion code\> ...** - The bot will create a 'voice dub' of the last n messages using the characters specified or random characters otherwise.
 * **\<prefix\>help** - The bot will reply with a general format on how to make a voice request, all the character codes for their respective characters and all the emotion codes.
 * **\<prefix\>invite** - The bot will send its invite link.
  
## Dependencies
  * [Discord.js](https://discord.js.org/)
  * [Bent](https://github.com/mikeal/bent)
  * [Mocha](https://mochajs.org/)
  * [Sinon](https://sinonjs.org/)

## Licensing
This project is licensed under the GNU GPLv3 - see [LICENSE](https://raw.githubusercontent.com/Kipwisp/vocal/master/LICENSE?token=AOSFA3HRIRAR4EIZHD4QQC26RUHEO) for details.
