# Vocal
Vocal is a Discord bot that utilizes fifteen's application to send generated voices from popular fictional characters upon user request. 
Be sure to check out fifteen's wonderful tool that makes this project possible. Their tool can be found at https://fifteen.ai/.

## Configuration
Configure the following values for the bot in config.json:
  * token: The unique token for your Discord bot
  * prefix: The prefix the bot looks for in a message in order to be activated
  * char_limit: The maximum number of characters allowed for a message, 140 is recommended
  * client_id: The client ID for your Discord bot

An example is shown here:
```
{ 
  "token"  : "XXXXXXXXXXXXXXXXXXXXXXXX.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "prefix" : "v!",
  "char_limit" : 140,
  "client_id": "000000000000000000"
}
```

## Setting up
Vocal runs on a Node.js server. If you do not have Node.js installed, install it [here](https://nodejs.org/en/download/).

To set up the bot, install the required dependencies for it with the following command:
```
npm install
```

## Running
Run the following command to start the bot:
```
node bot.js
```
Upon the bot successfully logging into Discord, a message should appear stating "Logged in as [bot name]!" in the console.

## Commands
The bot has the following commands:

 * **\<prefix\>\<xx\> \<message\>** - The bot will reply with a .wav file of the requested voice.
 * **\<prefix\>help** - The bot will reply with a general format on how to make a voice request and all the character codes for their respective characters.
 * **\<prefix\>invite** - The bot will send its invite link.
  
## Dependencies
  * [Discord.js](https://discord.js.org/)
  * [Bent](https://github.com/mikeal/bent)

## Licensing
This project is licensed under the GNU GPLv3 - see [LICENSE](https://raw.githubusercontent.com/Kipwisp/vocal/master/LICENSE?token=AOSFA3HRIRAR4EIZHD4QQC26RUHEO) for details.
