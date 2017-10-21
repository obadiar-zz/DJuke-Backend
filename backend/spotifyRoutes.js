const express = require('express')
const bodyParser = require('body-parser')
var spotify = require('../utils/SpotifyUtils.js')
const router = express.Router();

var generic = spotify.SpotifyUserInitialization;
var confirmExpectedPlaylistPlaying = spotify.confirmExpectedPlaylistPlaying;
var addTrackToPlaylist = spotify.addTrackToPlaylist;
var addTrack = spotify.addTrackToPlaylist;
var play = spotify.playSong;
var next = spotify.nextSong;
var localStorage = require('localStorage');

// create EventEmitter object
const EventEmitter = require('events');
var eventListener = new EventEmitter();


var spotifyData = {};

router.get("/registerHostSpotify", function(req, res){
  console.log("Receieved request.");
  var token = "Bearer " + req.query.token;
  generic(token, res);
})

router.get("/continueHostSpotify", function(req, res){
  console.log("Receieved request.");
  var token = "Bearer " + req.query.token;
  var user_id = req.query.user;
  var playlist_id = req.query.playlist;
  var playlist_uri = "spotify:user:" + user_id + ":playlist:" + playlist_id;

  spotifyData[user_id] = {
    playlist_id,
    token,
    user_id
  }
  confirmExpectedPlaylistPlaying(token, user_id, playlist_id, playlist_uri,res);
})

router.get("/addToPlaylist", function(req, res){
  // var song_uri = req.query.song_uri;
  // var user_id = Object.keys(spotifyData)[0];
  // var playlist_id = spotifyData[user_id].playlist_id;
  // var token = spotifyData[user_id].token;
  // var song_uri = song_uri;
  // var res = res;
  // addNextAndPlay(user_id, playlist_id, token, song_uri)
  setTimeout(function(){
    var user_id = Object.keys(spotifyData)[0];
    var playlist_id = spotifyData[user_id].playlist_id;
    var token = spotifyData[user_id].token;
    addNextAndPlay(user_id, playlist_id, token, res);
  },5000)
})


function addNextAndPlay(user_id, playlist_id, token){
  var queue = JSON.parse(localStorage.getItem("SongQueue")).list;
  var nextSong = queue.pop();
  var song_uri = "spotify:track:"+nextSong.id;

  eventListener.emit("nextSong_Spotify", queue);
  localStorage.setItem("SongQueue", JSON.stringify({list: queue}));

  addTrack(user_id, playlist_id, token, song_uri)

  setTimeout(function(){
    var user_id = Object.keys(spotifyData)[0];
    var playlist_id = spotifyData[user_id].playlist_id;
    var token = spotifyData[user_id].token;
    addNextAndPlay(user_id, playlist_id, token);
  },5000)
}

module.exports = {
  router,
  eventListener
};
