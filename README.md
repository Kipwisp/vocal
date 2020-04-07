# Vocal
Vocal is a Discord bot that utilizes fifteen's application to send generated voices upon user request. 
Be sure to check out fifteen's wonderful tool that makes this project possible. Their tool can be found at https://fifteen.ai/.

## Configuration
Configure the following values in config.json:
  * token: The unique token for your Discord bot
  * prefix: The prefix the bot looks for in a message in order to be activated
  * char_limit: The maximum number of characters allowed for a message, 140 is recommended

## Usage
The bot can be activated by a user sending a message of this format:
```
PREFIXxx message
```
where PREFIX is the prefix that activates the bot, xx is the character code, and message is the user's message that will be sent to fifteen's tool.
The bot will reply with a .wav file of the requested voice or an error if something unexpected occurred.

Users can ask for help from the bot by saying:
```
PREFIXhelp
```
The bot will reply with a general format on how to make a voice request and all the character codes for their respective characters.

## Running
Vocal runs on a Node.js server. Run the following command to start the bot:
```
node bot.js
```
Upon the bot successfully logging into Discord, a message should appear stating "Logged in as [bot name]!"

## Dependencies
  * [Discord.js](https://discord.js.org/)
  * [Bent](https://github.com/mikeal/bent)

## Licensing
This project is licensed under the GNU GPLv3 - see [LICENSE](https://raw.githubusercontent.com/Kipwisp/vocal/master/LICENSE?token=AOSFA3HRIRAR4EIZHD4QQC26RUHEO) for details.
