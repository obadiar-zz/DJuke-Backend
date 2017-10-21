const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8228;
var http = require('http').Server(app);
var io = require('socket.io')(http);
const SpotifyUtils = require('./utils/SpotifyUtils')
const routes = require('./backend/routes');
const Queue = require('./backend/queue')

const SPOTIFY_TOKEN = "Bearer BQD7SHEJA6OWEZUB3iZFYpj7q8LGCo8UcWwL5-zeIbm6G5KyCjbhNfhU4zVK8tnJOmFbOKrd5mQanos12KB4mLTR0VhX3kKbY0ZD3nRl9N4mCpAVvKx34qQf3eAZfPoE0dis5Z5NJiFAxjsap6nbyUBt5LHYKx4ucfJin2Oa024uEVQgoMfo5Shfu5Eg5eNE71rON3yqm1uLDU3MoLNXCc8xj7MY3TA-GUPaYRdgYhOGFvp2oXi_6Bgd5WdcRXd5-Io1bK1OPmohyz69elYt0hmuuQJwHVfHtOC09BNPpzNyetNK9tur4t9apMrTidJqFe-7vVjLxYY6ozMbxSZHxtJH_Q"

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/public/index.html');
});

var SongQueue = new Queue();

app.use('/', routes);

io.on('connection', function (socket) {
    socket.emit('QUEUE_UPDATED', SongQueue);

    socket.on('CONNECT', function () {
        console.log(socket.id, 'connected!');
        socket.emit('SUCCESS', 'CONNECTED');
    });

    socket.on('ADD_SONG', function (data) {
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
        if (SongQueue.toggleUpvote(socket.id, data.id)) {
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
