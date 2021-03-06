/**
 * @file
 * Application routes used to maintain the proxy.
 */

// Load token library.
var jwt = require('jsonwebtoken');

// Load configuration.
var config = require('./../lib/configuration');

/**
 * Index page (/).
 */
exports.index = function index(req, res) {
  res.render('index', { sitename: config.get('sitename') });
};

/**
 * Login callback (/login)
 *
 * The maintenance login page, used to get token an socket auth
 * token. Which can be used to pull proxy status information.
 */
exports.login = function login(req, res, jwt_secret) {
  var profile = {
    username: req.body.username,
    password: req.body.password
  };

  var maintenance = config.get('maintenance');
  if (profile.username === maintenance.username && profile.password === maintenance.password) {
    // We are sending the profile inside the token
    var token = jwt.sign(profile, jwt_secret, { expiresInMinutes: 60*24*365 });
    res.json({token: token});
  }
  else {
    // Access denied.
    res.send(403);
  }
};
