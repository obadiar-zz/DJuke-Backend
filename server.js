const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8228;
var http = require('http').Server(app);
var io = require('socket.io')(http);
const SpotifyUtils = require('./utils/SpotifyUtils')
const routes = require('./backend/routes');
const Queue = require('./backend/queue');
const spotify = require('./backend/spotifyRoutes');

const SPOTIFY_TOKEN = "Bearer BQCX7KV4Ex2dK2APNpNl0VT51J_uCNaJE7AbOjy-9j6uzF1egW_MMKIN9MTQKHrOZeISVynm7mCyNw7LbCNVmYYZXvFzsIAEVo3FDD5I3XlUG-BDvYsPbzLk9_s2kBWyY4jGJ5dNAi5GC08SLnCPjsVjGUFj2k1TIVf_nPplmDIPmzio9O_gWHxfc-2wVJdD2xgMTwOWpgjV0gQJ8pI2fhbQted0A-rvHmoXOcio4k8uibSm1NQlc9ScDDep1_ADJHJVjZ63lhwrkpFMcGbwdQPRt4WAJG89dL50JBatebcLwaOmCPqGUJRpULNhQsmoQj4Red0"

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/public/index.html'); // For React/Redux
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var SongQueue = new Queue();

app.use('/', routes);
app.use('/', spotify);

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
