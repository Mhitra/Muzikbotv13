const ayarlar = require('./config.json');
const testToken = ayarlar.token;

const {
	REST
} = require('@discordjs/rest');
const {
	Routes
} = require('discord-api-types/v9');
const {
	Client,
	Intents,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	Collection,
	MessageSelectMenu
} = require("discord.js");
const {
	readdirSync
} = require("fs");
const client = new Client({
	intents: 32767,
	presence: {
		status: 'idle',
		afk: false,
		activities: [{
			name: 'AYATOON.COM',
			type: 'LISTENING'
		}],
	}
});
const {
	Player
} = require("discord-player");
const player = new Player(client);
var embed = (g, u) => {
	return new MessageEmbed().setColor(g.me.roles.highest.color).setFooter({
		text: `${u.tag} tarafından istendi.`,
		iconURL: `${u.displayAvatarURL()}`
	});
};
client.login(testToken);
client.on("ready", async () => {
	console.log ('_________________________________________');
	console.log (`Bot İsmi           : ${client.user.username}`);
	console.log (`Sunucular          : ${client.guilds.cache.size}`);
	console.log (`Kullanıcılar       : ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}`);
	console.log (`Durum              : Bot Çevrimiçi!`);
	console.log('Global komutlar     : Güncellendi.');
	console.log ('_________________________________________');
	console.log(`» Designed and Developed by Mhitra. «`)});


// Buton Etkileşimleri
client.buttonInteractions = new Collection();
readdirSync("./buttonInteractions/").forEach(f => {
	let cmd = require(`./buttonInteractions/${f}`);
	client.buttonInteractions.set(cmd.customId, cmd);
});
// Buton Etkileşimleri

// Slash Etkileşimleri
client.slashInteractions = new Collection();
let globalSlashCommands = [];
readdirSync("./slashInteractions/").forEach(f => {
	let cmd = require(`./slashInteractions/${f}`);
	client.slashInteractions.set(cmd.name, cmd);
	globalSlashCommands.push(cmd.command);
});
// Slash Etkileşimleri


// Slash Global Komutlar Ekleyelim
let rest = new REST({
	version: '9'
}).setToken(testToken);

client.on("ready", async () => {
	try {

		await rest.put(
			Routes.applicationCommands(client.user.id), {
				body: globalSlashCommands
			},
		);

	} catch (error) {
		console.error(error);
	};
});
// Slash Global Komutlar Ekleyelim


client.on("interactionCreate", async int => {

	if (int.isCommand()) {
		if (int.guild.me.voice.channelId && int.member.voice.channelId !== int.guild.me.voice.channelId) return await int.reply({
			content: "Ben başka bir kanaldayım ! ",
			ephemeral: true
		});
		else if (!int.guild.me.voice.channelId && int.commandName != "çal" && int.commandName != "ara" && int.commandName != "kapat") return await int.reply({
			content: "Ben herhangi bir kanalda değilim ! ",
			ephemeral: true
		});
		else if (!int.member.voice.channelId) return await int.reply({
			content: "Bir ses kanalında değilsin ! ",
			ephemeral: true
		});
		else client.slashInteractions.get(int.commandName)?.run(client, int, player, embed);
	} else client.buttonInteractions.get("add-music").run(client, int, player, embed);

});

client.on('voiceStateUpdate', (oldState, newState) => {
	if (oldState.channelId && !newState.channelId && newState.id === client.user.id) {
		let queue = player.createQueue(oldState.guild, {
			metadata: {
				
			}
		});

		queue.destroy(true);
	};
});

player.on("trackStart", (queue, track) => queue.metadata.channel.send({
	embeds: [embed(queue.guild, track.requestedBy)
		.setTitle("🎶 Çalıyor 🎶")
		.addField("İsim", `${track.title}`, true)
		.addField("Yayınlayan", `${track.author}`, true)
		.addField("İzlenme", `${track.views}`, true)
		.setImage(`${track.thumbnail}`)]
}))
