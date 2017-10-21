const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8228;
var http = require('http').Server(app);
var io = require('socket.io')(http);
const SpotifyUtils = require('./utils/SpotifyUtils')
const routes = require('./backend/routes');
const Queue = require('./backend/queue')

const SPOTIFY_TOKEN = "Bearer BQCwDi-HByTOKhBhRjXX0Qh3s6sfOaWIyvz4vkcDDZj-tn9qtbqRq3BtK78zckDFZ_XrrQ4Ct9yKT2ONU3jEJRkWAQuTVwp6tGPdGQe1KLW0vrIAsn_j2Y5VdxBa1Q4tp3eCnk8sCa8yIv6lCaF-BdnJc6AFxKj63xLckPTmN_G5ANL8vbJ4aq7HnVGBUOpNe24hFpVMM6bffEYZlkWVImTcmKeoudpAuqi9I3yPghpgRQv4r7anKPtV60tv_0VUuWM6Sr8_WIFVtecUsvCFpEJ2uuKGOpFD_taeYyUG3t1LU0zDaTY3xqfeleHBWcxSSw"

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/public/index.html'); // For React/Redux
});

var SongQueue = new Queue();

app.use('/', routes);

io.on('connection', function (socket) {
    var ip;
    socket.emit('QUEUE_UPDATED', SongQueue);

    socket.on('CONNECT', function (data) {
        console.log(data.ip, 'connected!');
        ip = data.ip;
        socket.emit('SUCCESS', 'CONNECTED');
    });

    socket.on('ADD_SONG', function (data) {
        function callback(result) {
            var newSong = {
                title: result.title,
                artist: result.artist,
                duration: SpotifyUtils.msToMinutes(result.duration),
                id: result.id,
                upvotes: {},
                payment: 0,
                requestor_ip: data.ip,
                thumbnail: result.thumbnail,
                time: String(new Date())
            }
            if (!SongQueue.addSong(newSong)) {
                socket.emit('ERROR', 'SONG_ALREADY_IN_QUEUE');
            } else {
                socket.emit('SUCCESS', 'SONG_ADDED');
            }
            SongQueue.sort();
            io.emit('QUEUE_UPDATED', SongQueue);
            console.log(SongQueue);
        }
        SpotifyUtils.getSongInfo(SPOTIFY_TOKEN, data.id, callback)
    })

    socket.on('REMOVE_SONG', function (data) {
        SongQueue.removeSong(data.id);
        socket.emit('SUCCESS', 'SONG_REMOVED')
        SongQueue.sort();
        io.emit('QUEUE_UPDATED', SongQueue);
        console.log(SongQueue);
    })

    socket.on('UPVOTE_SONG', function (data) {
        if (SongQueue.toggleUpvote(ip, data.id)) {
            socket.emit('SUCCESS', 'SONG_UPVOTE_ADDED')
        } else {
            socket.emit('SUCCESS', 'SONG_UPVOTE_REMOVED')
        }
        SongQueue.sort();
        io.emit('QUEUE_UPDATED', SongQueue);
        console.log(SongQueue);
    })

    socket.on('PAY_SONG', function (data) {
        SongQueue.addPayment(data.id, data.amount);
        socket.emit('SUCCESS', 'SONG_PAYMENT_UPDATED');
        SongQueue.sort();
        io.emit('QUEUE_UPDATED', SongQueue);
        console.log(SongQueue);
    })
});

http.listen(PORT, error => {
    error
        ? console.error(error)
        : console.info(`==> 🌎 Listening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`);
});
