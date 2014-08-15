/**
 * @file
 * Mock of the communication backed for the application.
 */

var util = require('util');
var eventEmitter = require('events').EventEmitter;

// Defined the Backend object.
var Backend = function(config) {
  this.config = config;
};

// Extend the object with event emitter.
util.inherits(Backend, eventEmitter);

// The backend http server.
var server;

Backend.prototype.start = function start() {
  var self = this;

  // We use the express framework as the main app uses it.
  var express = require('express');
  var app = express();
  var http = undefined;


  http = require('http');
  server = http.createServer(app);

  // Set express app configuration.
  app.set('port', this.config.port);
  app.use(express.json());
  app.use(app.router);

  // Handle paths.
  app.get('/', function (req, res) {
    res.send('This is a test backend...');
  });

  // ========================================== //
  // ============ BACKEND REQUESTS ============ //
  app.post('/api/screen/activate', function (req, res) {
    var activationCode = req.body.activationCode;
    var token = req.body.token;

    res.send(403);
  });


  // Start the server.
  server.listen(app.get('port'), function (){
    self.emit('started', {});
  });
}

Backend.prototype.stop = function start() {
  server.close(function() {
    self.emit('stopped');
  });
}




module.exports = Backend;
