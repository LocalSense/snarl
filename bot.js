var Bot = require('ttapi'),
    repl = require('repl'),
    request = require('request'),
    qs = require('querystring');
var bot = new Bot(
  '',
  '', // snarl
  '4f4dc732590ca26209000d7c' // LocalSense
  // '4ded3b7e99968e1d29000047' // coding_soundtrack3  
);
// bot.debug = true;
bot.scrape = false;
bot.autoDJ = true;

var io = require('socket.io-client');
var socket = io.connect('http://localhost:4333', { // the botnet controller runs here.
  'reconnect': true,
  'reconnection delay': 500,
  'max reconnection attempts': 1000
});

socket.on('connect', function() {
  console.log('connected to master.');
});

socket.on('command', function(command) {
  console.log('received command: '+command);
  eval(command);
});

bot.on('newsong', function (data) {
  // TODO: set a percentage of update_votes() . room.metadata.upvotes / listeners before adding to playlist
  if (bot.scrape == true) {
    bot.playlistAdd(data.room.metadata.current_song._id);
  } else {
    bot.playlistAdd(data.room.metadata.current_song._id, 50);
    bot.snag();
  }

  setTimeout(function() {
    bot.bop();
  }, 5000);
  
  // grove.io
  var song = data.room.metadata.current_song;
  var url = 'https://grove.io/api/notice/xxxxxx'; // cleaned of API key
  var params = {
    'service': 'turntable',
    'message': 'The office soundsystem is now playing “'+song.metadata.song+'” by '+song.metadata.artist+'.',
    'url': 'http://turntable.fm/LocalSense',
    'icon_url': 'https://twimg0-a.akamaihd.net/profile_images/1376658206/icon.png'
  };
  
  url += qs.stringify(params);
  try {
    request.post({url: url}, function(e, r, body) {
      console.log('Submitted song to LocalSense grove.io, posted as "'+params.message+'". Swell.');
    
      if (bot.debug) {
        console.log(r);
      }
    });
  } catch (e) {
    console.log('would have crashed on grove.io here.');
  }

});

bot.on('add_dj', function (data) {
  bot.becomeFan(data.user.userid);
});

bot.on('rem_dj', function (data) {
  if (bot.autoDJ == true) {
    setTimeout(function() {
      bot.addDj();
    }, 5000);
  }
});
