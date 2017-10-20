const express = require('express')
const bodyParser = require('body-parser')
const router = express.Router();

var generic = spotify.SpotifyUserInitialization;
var confirmExpectedPlaylistPlaying = spotify.confirmExpectedPlaylistPlaying;
var addTrackToPlaylist = spotify.addTrackToPlaylist;
var play = spotify.playSong;

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
  console.log(playlist_uri);
  confirmExpectedPlaylistPlaying(token, playlist_uri,res);
})
