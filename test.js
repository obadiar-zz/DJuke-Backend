const axios = require('axios');
const io = require('socket.io-client');
const ip = require('ip');

var localServer = '';
const PORT = '8228';

axios.get("https://rocky-brook-68243.herokuapp.com/discover")
	.then(response => {
		localServer = response.data;
		const connectionAddress = 'http://' + localServer + ':' + PORT;
		var socket = io(connectionAddress);
		socket.emit('IP_CONNECTED', {
			ip: ip.address()
		})
	})
	.catch(error => console.log('A problem has occured..'));

