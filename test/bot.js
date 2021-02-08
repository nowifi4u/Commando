/* eslint-disable no-console */
const commando = require('../src');
const path = require('path');
const oneLine = require('common-tags').oneLine;
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const token = require('./auth').token;

const client = new commando.Client({
	owner: '250148489797828609',
	commandPrefix: 'cdev'
});

client.locales.loadDefault('en');
client.locales.loadDefault('ru');

client
	.on('error', console.error)
	.on('warn', console.warn)
	.on('debug', console.log)
	.on('ready', () => {
		console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
	})
	.on('disconnect', () => { console.warn('Disconnected!'); })
	.on('reconnecting', () => { console.warn('Reconnecting...'); })
	.on('commandError', (cmd, err) => {
		if(err instanceof commando.FriendlyError) return;
		console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
	})
	.on('commandBlock', (msg, reason) => {
		console.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
	})
	.on('commandPrefixChange', (guild, prefix) => {
		console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('commandStatusChange', (guild, command, enabled) => {
		console.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('groupStatusChange', (guild, group, enabled) => {
		console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	});

sqlite.open({
	filename: path.join(__dirname, 'database.sqlite3'),
	driver: sqlite3.Database
}).then(db => {
	client.setProvider(new commando.SQLiteProvider(db));
}).catch(console.error);

client.registry
	.registerGroup('math', 'Math')
	.registerDefaultTypes()
	.registerDefaultGroups()
	.registerDefaultCommands(
	{
		unknownCommand: false
	})
	.registerTypesIn(path.join(__dirname, 'types'))
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.login(token);
