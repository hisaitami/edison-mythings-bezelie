var conf = require('config');
var meshblu = require('meshblu');
var request = require('request');

var conn = meshblu.createConnection(conf.meshblu);
conn.on('ready', function(data){
    console.log('Ready');

    conn.on('message', function(data){
        console.log(data);
    });
});

var five = require('johnny-five');
var Edison = require('edison-io');
var board = new five.Board({
  io: new Edison()
});

board.on('ready', function() {
  var led = new five.Led(13);
  led.blink();

  board.servoWrite(3, 45);
});
