/**
 * @file
 * Client mock.
 */

var util = require('util');
var eventEmitter = require('events').EventEmitter;

var Client = function (config) {
 this.config = config;
};

// Extend the object with event emitter.
util.inherits(Client, eventEmitter);

Client.prototype.send = function send(path, json) {
  var self = this;
  var options = {
    hostname: 'infostander.vm',
    port: this.config.port,
    path: '',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': 0
    }
  };

  // Encode the JSON into string.
  var data = JSON.stringify(json);

  // Create options array for the request.
  options['path'] = path;
  options.headers['Content-Length'] = data.length;

  var http = require('http');
  var req = http.request(options, function(res) {
    var msg = '';

    console.log('test');

    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      msg += chunk;
    });

    // Handle end request.
    res.on('end', function() {
      if (res.statusCode == 200) {
        if (msg.length) {
          console.log(msg);
          self.emit('completed', JSON.parse(msg));
        }
        else {
          self.emit('completed', {});
        }

      }
      else {
        self.emit('error', { statusCode: res.statusCode });
      }
    });
  });

  // Send the request.
  req.write(data);
  req.end();
}


module.exports = Client
