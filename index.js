const tmi = require('tmi.js');
const express = require('express');
const fs = require("fs");
const app = express();

const quotes = fs.readFileSync("quotes.txt", "utf-8").split("\n");

app.use("/chi", function(req, res) {
  res.send(quotes.join("<br>"));
})

app.use("/", function(req, res) {
  res.redirect(301, "/chi" + req.url);
})

app.listen(443, function() {
  console.log(quotes)
});

// Valid commands start with:
let commandPrefix = '!'
// Define configuration options:
let opts = {
  identity: {
    username: 'quoteplant',
    password: 'oauth:vecsqwidq6nlc8zvt4mujc6e6np7ul'
  },
  channels: [
    'byhemechi',
    'karljobst'
  ]
}

// These are the commands the bot knows (defined below):
let knownCommands = { quote, submitquote,commands }

// Function called when the "echo" command is issued:
function quote (target, context, params) {
  sendMessage(target, context, "\"" + quotes[Math.floor(Math.random()*quotes.length)] + "\" - karljobstSCHWARZENEGGPLANT");
}
function submitquote (target, context, params) {
  sendMessage(target, context, "submit quotes to https://github.com/zsty/quoteplant (via pull request)");
}
function commands (target, context, params) {
  sendMessage(target, context, "Say !quote for an excellent eggplant quote.");
}


// Helper function to send the correct type of message:
function sendMessage (target, context, message) {
  if (context['message-type'] === 'whisper') {
    client.whisper(target, message)
  } else {
    client.say(target, message)
  }
}

// Create a client with our options:
let client = new tmi.client(opts)

// Register our event handlers (defined below):
client.on('message', onMessageHandler)
client.on('connected', onConnectedHandler)
client.on('disconnected', onDisconnectedHandler)

// Connect to Twitch:
client.connect()

// Called every time a message comes in:
function onMessageHandler (target, context, msg, self) {
  if (self) { return } // Ignore messages from the bot

  // This isn't a command since it has no prefix:
  if (msg.substr(0, 1) !== commandPrefix) {
    return
  }

  // Split the message into individual words:
  const parse = msg.slice(1).split(' ')
  // The command name is the first (0th) one:
  const commandName = parse[0]
  // The rest (if any) are the parameters:
  const params = parse.splice(1)

  // If the command is known, let's execute it:
  if (commandName in knownCommands) {
    // Retrieve the function by its name:
    const command = knownCommands[commandName]
    // Then call the command with parameters:
    command(target, context, params)
    console.log(`* Executed ${commandName} command for ${context.username}`)
  } else {
    console.log(`* Unknown command ${commandName} from ${context.username}`)
  }
}

// Called every time the bot connects to Twitch chat:
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}

// Called every time the bot disconnects from Twitch:
function onDisconnectedHandler (reason) {
  console.log(`Disconnected: ${reason}`)
  process.exit(1)
}
