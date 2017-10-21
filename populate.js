const axios = require('axios');
const io = require('socket.io-client');
const ip = require('ip');

var connectionAddress = 'http://10.2.106.85:8228';

var songList = ['0Hf4aIJpsN4Os2f0y0VqWl', '18LgnmZIds56d00L53aauA', '4xkOaSrkexMciUUogZKVTS', '1OmcAT5Y8eg5bUPv9qJT4R', '0qqwzVWiVmIRynDh1nTGCG', '0AOEd0Zw22aTE8LzsS4EMg', '24CXuh2WNpgeSYUOvz14jk', '2771LMNxwf62FTAdpJMQfM', '0t2w4jQazlBggyZS4axpnw'];

var socket = io(connectionAddress);
socket.emit('CONNECT', {
	ip: ip.address()
})

for (var i = 0; i < songList.length; i++) {
	for (var x = 0; x < 100000000; x++) {

	}
	socket.emit('ADD_SONG', {
		id: songList[i]
	})
}

socket.on("QUEUE_UPDATED", function (data) {
	console.log('====================================');
	console.log(data);
	console.log('====================================');
})

socket.on("ERROR", function (data) {
	switch (data) {
		case "SONG_ALREADY_IN_QUEUE":
			console.log("This song is already in the queue.");
			break;
		default:
			console.log(data);
	}
})

socket.on("SUCCESS", function (data) {
	switch (data) {
		case "CONNECTED":
			console.log("Connected to DJuke.io server!")
			break;
		case "SONG_ADDED":
			console.log("Song added.");
			break;
		case "SONG_REMOVED":
			console.log("Song removed.");
			break;
		case "SONG_UPVOTE_ADDED":
			console.log("Upvote submitted.");
			break;
		case "SONG_UPVOTE_REMOVED":
			console.log("Upvote removed.");
			break;
		case "SONG_PAYMENT_UPDATED":
			console.log("Payment recorded.");
			break;
		default:
			console.log(data);
	}
})