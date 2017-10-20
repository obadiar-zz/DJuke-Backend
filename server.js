const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8228;
var http = require('http').Server(app);
var io = require('socket.io')(http);
const routes = require('./backend/routes');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/public/index.html'); // For React/Redux
});

app.use('/', routes);

io.on('connection', function (socket) {

    socket.on('IP_CONNECTED', function (data) {
        console.log(data.ip, 'connected!')
    })

});

http.listen(PORT, error => {
    error
        ? console.error(error)
        : console.info(`==> 🌎 Listening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`);
});
