const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8228;
var http = require('http').Server(app);
var io = require('socket.io')(http);
const SpotifyUtils = require('./utils/SpotifyUtils')
const SCUtils = require('./utils/SCUtils')
const routes = require('./backend/routes');
const Queue = require('./backend/queue');
const spotify = require('./backend/spotifyRoutes').router;
const spotifyFirstSong = require('./backend/spotifyRoutes').firstSong;
const spotifyEventListener = require('./backend/spotifyRoutes').eventListener;
var localStorage = require('localStorage');

var firstSong = true;

spotifyEventListener.on("nextSong_Spotify", function(data) {
    // process data when someEvent occurs
    console.log("Broadcast new song added");
    io.emit('NEXT_SONG', data);
});

spotifyEventListener.on("spotify_done", function(data) {
  console.log("EHEHEHHEHEHEHEH");
    // process data when someEvent occurs
    firstSong = true;
});

const SPOTIFY_TOKEN = "Bearer BQDa0THhgMHSpJy0-jecIMSMHOp55qlYCgI7-Ng2_t5yUqV6j0XaR5Kgf4PTrRo91qs_WCvcdL7dAiegC-yC7mkCssbtysm7-IsbZMwZNKrI6e7fdNXSNCe9NcS6s7MuWXxynhzfDV9KIP-m3UrI-tjYicafAVOPjJWrhD98Dng1edsZEwsDWqx56dI41HcLEK7OZ-iEELEG-pLREovmYD6TVnX8IHm1nj2wY2R83CdrKoFMrpAlNnMv-tt8U8IYnmlE1u2Ux-wXJwSKbrl2YJj0miuBrQ4amxN5rDvjylJj5yzrwHn51IYk2BDsZN3dtag_70I"

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
localStorage.setItem("SongQueue", JSON.stringify(SongQueue));

app.use('/', routes);
app.use('/', spotify);

io.on('connection', function (socket) {

    g_socket = socket;

    var ip;
    socket.emit('QUEUE_UPDATED', SongQueue);

    socket.on('CONNECT', function (data) {
        console.log(data.ip, 'connected!');
        ip = data.ip;
        socket.emit('SUCCESS', 'CONNECTED');
    });

    socket.on('ADD_SONG', function (data) {
      console.log("SONG ADDED");
      SongQueue.list = JSON.parse(localStorage.getItem("SongQueue")).list;
        function callback(result) {
            var newSong = {
                title: result.title,
                artist: result.artist,
                duration: SpotifyUtils.msToMinutes(result.duration),
                durationS: result.duration / 1000,
                id: result.id,
                upvotes: {},
                payment: data.payment || 0,
                requestor_id: socket.id,
                thumbnail: result.thumbnail,
                time: String(new Date())
            }
            if (!SongQueue.addSong(newSong)) {
                socket.emit('ERROR', 'SONG_ALREADY_IN_QUEUE');
            } else {
                socket.emit('SUCCESS', 'SONG_ADDED');
            }
            SongQueue.sort();
            localStorage.setItem("SongQueue", JSON.stringify(SongQueue));
            io.emit('QUEUE_UPDATED', SongQueue);
            if(firstSong){
              spotifyFirstSong()
              firstSong = false;
            }
        }
        if (data.type === 'spotify') {
            SpotifyUtils.getSongInfo(SPOTIFY_TOKEN, data.id, callback)
        } else {
            SCUtils.getSongInfo(data.id, callback)
        }
    })

    socket.on('REMOVE_SONG', function (data) {
      SongQueue.list = JSON.parse(localStorage.getItem("SongQueue")).list;
        SongQueue.removeSong(data.id);
        socket.emit('SUCCESS', 'SONG_REMOVED')
        SongQueue.sort();
        localStorage.setItem("SongQueue", JSON.stringify(SongQueue));
        io.emit('QUEUE_UPDATED', SongQueue);
        console.log(SongQueue);
    })

    socket.on('UPVOTE_SONG', function (data) {
      SongQueue.list = JSON.parse(localStorage.getItem("SongQueue")).list;
        if (SongQueue.toggleUpvote(ip, data.id)) {
            socket.emit('SUCCESS', 'SONG_UPVOTE_ADDED')
        } else {
            socket.emit('SUCCESS', 'SONG_UPVOTE_REMOVED')
        }
        SongQueue.sort();
        localStorage.setItem("SongQueue", JSON.stringify(SongQueue));
        io.emit('QUEUE_UPDATED', SongQueue);
        console.log(SongQueue);
    })

    socket.on('PAY_SONG', function (data) {
      SongQueue.list = JSON.parse(localStorage.getItem("SongQueue")).list;
        SongQueue.addPayment(data.id, data.amount);
        socket.emit('SUCCESS', 'SONG_PAYMENT_UPDATED');
        SongQueue.sort();
        localStorage.setItem("SongQueue", JSON.stringify(SongQueue));
        io.emit('QUEUE_UPDATED', SongQueue);
        console.log(SongQueue);
    })
});

http.listen(PORT, error => {
    error
        ? console.error(error)
        : console.info(`==> 🌎 Listening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`);
});
