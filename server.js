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
    console.log(data);
    g_socket.emit('QUEUE_UPDATED', {
      currentlyPlaying: data.currentlyPlaying,
      list: data.list
    });
});

spotifyEventListener.on("spotify_done", function(data) {
  console.log("EHEHEHHEHEHEHEH");
    // process data when someEvent occurs
    firstSong = true;
});

const SPOTIFY_TOKEN = "Bearer BQA1wE9P9gj02wklXU7_GWOxJ9StpJ8uXbQ1-tySC5FT-E2Hzum4ZeE6j5OTkr-wrnGXFYgEYK--PRdzH5SJQsmpNLx_uX-UZCkCS16ig6XcAP9U9rv2McJsCo_nV1ro_Zl6QUV7ZQg7w8ZGT8k987WlChenYTkpIgrVx-zbweTqFCve7rWwPscFGdduHqowrQhh01RJT2co0-y_4uylyeZ2FCGMI-d3OKj7KkzNaWDBwo4feLQlhJI7ZQLB63KjI6ARBniqLmRrMqkZ1JAFJcNet4RSjscopX13aBZxQ3f2Mn5jiTBp0PoCI-q6Z0ZW0I33TF0"

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

    g_socket = io;

    var id;
    socket.emit('QUEUE_UPDATED', SongQueue);

    socket.on('CONNECT', function () {
        id = socket.id;
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
      var currentlyPlaying = JSON.parse(localStorage.getItem("currentlyPlaying"));

      SongQueue.list = JSON.parse(localStorage.getItem("SongQueue")).list;
        if (SongQueue.toggleUpvote(id, data.id)) {
            socket.emit('SUCCESS', 'SONG_UPVOTE_ADDED')
        } else {
            socket.emit('SUCCESS', 'SONG_UPVOTE_REMOVED')
        }
        SongQueue.sort();
        localStorage.setItem("SongQueue", JSON.stringify(SongQueue));
        // io.emit('QUEUE_UPDATED', {
        //   list: SongQueue,
        //   currentlyPlaying: currentlyPlaying
        // });
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
