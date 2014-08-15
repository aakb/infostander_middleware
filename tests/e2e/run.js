/**
 * @file
 * End-2-End test of the application. It will run the application and emulate
 * the backend and frontend to check information flow through the application.
 */

// Parse commandline args.
var argv = require('minimist')(process.argv.slice(2));

var exec = require('child_process').exec;
var child;

// Start backend server.
var Backend = require('./lib/backend.mock');
var backend = new Backend({ 'port' : 8080 });
backend.start();

// Start the application.
child = exec('node ../../app.js --config=tests/e2e/config-test.json',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});

// ======================================= //
// =========== Start the tests =========== //
// ======================================= //
describe("Application tests", function() {
  it("Create connection", function(done) {

  });
}