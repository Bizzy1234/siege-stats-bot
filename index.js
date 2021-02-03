// file      : index.js
// copyright : Copyright (c) 2020-present, Kyle Chapman
// license   : GPL-3.0; see accompanying LICENSE file

// invite link : https://discord.com/oauth2/authorize?client_id=805758708394098695&scope=bot

const fs = require('fs');
const dotenv = require('dotenv');
const Discord = require('discord.js');

const config = require('./config.json');

// configure for .env file reading
dotenv.config();

// store token from environment file
const token = process.env.TOKEN;

// only read messages starting with `validPrefix`
const validPrefix = config.prefix + config.name;

const client = new Discord.Client();
client.commands = new Discord.Collection();

// read separate command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// register discord commands
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// trigger when application is ready
client.once('ready', () => {
	console.log('Ready!');
});

// upon receiving a message
client.on('message', message => {
	const content = message.content;

	// ignore messages that do not start with prefix and name
	if (!content.startsWith(validPrefix) || message.author.bot) {
		return;
	}

	// get additional arguments
	const args = content.slice(validPrefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	// not valid command
	if (!client.commands.has(commandName)) {
		message.reply(`\`${commandName}\` is not a recognized command!`);
		return;
	}

	// get command
	const command = client.commands.get(commandName);

	// attempt to execute command
	try {
		command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.reply(`Error executing command \`${commandName}\`!`);
	}
});

// login with token from environment file
client.login(token);
