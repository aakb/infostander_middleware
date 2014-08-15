/**
 * @file
 * End-2-End test of the application. It will run the application and emulate
 * the backend and frontend to check information flow through the application.
 */

// Parse commandline args.
var argv = require('minimist')(process.argv.slice(2));

// Load confiuration.
var conf_file = 'tests/e2e/config-test.json';
var config = require('nconf');
config.file({ "file": conf_file, "search": true });

// Get backend server.
var Backend = require('./lib/backend.mock');
var back = new Backend({ 'port' : 8080 });

// Get client.
var Client = require('./lib/client.mock');
var frontend = new Client({ 'port' : 3080 });

// Start the application.
var exec = require('child_process').exec;
var child;
child = exec('node app.js --config=' + conf_file,
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});

// Give the application a change to start-up.
require('sleep').sleep(1);


// ======================================= //
// =========== Start the tests =========== //
// ======================================= //
// describe("Application end-2-end tests - ", function() {

// it("Activation", function(done) {
//     back.start();
//     back.once('started', function() {
//       frontend.on('completed', function(data) {
//         console.log('1');
//         // Send valided token to the frontend.
//         // console.log(data);
//               done();
//       });

//       // frontend.on('error', function(data) {
//       //   console.log('2');
//       //   // Error in the request send http code.
//       //   // console.log(data);
//       //         done();
//       // });
//       frontend.send('/activate', { activationCode: 'test' });
//       // done();
//     });
//   });
// });

back.start();
back.once('started', function() {
  frontend.on('completed', function(data) {
    // Send valided token to the frontend.
    console.log(data);
  });

  frontend.on('error', function(data) {
    // Error in the request send http code.
    console.log(data);
  });
  frontend.send('/activate', { activationCode: '12345678' });
});
