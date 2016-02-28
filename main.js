var conf = require('config');
var sleep = require('sleep');

/** required for myThigns */
var meshblu = require('meshblu');
var request = require('request');

/** required for controlling Bezelie with Edison */
var five = require('johnny-five');
var Edison = require('edison-io');
var board = new five.Board({
  io: new Edison()
});

/** speak */
if (conf.voicetext.enabled) {
  var fs = require('fs');
  var VoiceText = require('voicetext');
  var Sound = require('simple-mplayer');
  var voice = new VoiceText(conf.voicetext.apikey);
}

/** define PWM pins */
var pwmPITCH = 3;
var pwmROLL  = 5;
var pwmYAW   = 6;

var moving = false;

board.on('ready', function() {
  var led = new five.Led(13);
  led.blink();

  defaultPosition();

  // connect to IDCF channel server
  var conn = meshblu.createConnection(conf.meshblu);
  conn.on('ready', function(data){
    console.log('Ready');


    // let Bezelie dance when receiving a new message
    conn.on('message', function(data){
      console.log(data);
      dance();

      if (conf.voicetext.enabled) {
        voice.speaker(voice.SPEAKER.HARUKA)
             .emotion(voice.EMOTION.HAPPINESS)
             .emotion_level(voice.EMOTION_LEVEL.LOW)
             .pitch(100)
             .speed(100)
             .volume(100)
             .speak(data.payload, function (e, buf) {
               return fs.writeFile('./talk.wav', buf, 'binary', function (e) {
                 if (e) {
                   return console.error(e);
                 }
                 new Sound('talk.wav').play();
               });
             });
      }
    });
  });
});

function defaultPosition() {
  roll(80, 0);
  yaw(80, 700);
  pitch(80, 700);
}

function dance() {
  if (moving) return;

  setTimeout(function() {
    pitch(70, 700);
    for (var i = 0; i < 3; i++) {
      roll(60, 700);
      roll(100, 700);
    }
    defaultPosition();
    moving = false;
  }, 100);
}

function pitch(degree, duration_ms) {
  board.servoWrite(pwmPITCH, degree);
  sleep.usleep(duration_ms * 1000);
}

function roll(degree, duration_ms) {
  board.servoWrite(pwmROLL, degree);
  sleep.usleep(duration_ms * 1000);
}

function yaw(degree, duration_ms) {
  board.servoWrite(pwmYAW, degree);
  sleep.usleep(duration_ms * 1000);
}

