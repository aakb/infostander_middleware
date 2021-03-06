/**
 * @file
 * Defines the reset API routes used by the back-end.
 */

// Load configuration.
var config = require('./../lib/configuration');

/**
 * Helper function to check the backend request only comes from the backend.
 */
function accessCheck(req) {
  if (config.get('backend').ip === req.ip) {
    return true;
  }
  return false;
}

/**
 * Update screen information.
 */
exports.screenUpdate = function screenUpdate(req, res) {
  if (!accessCheck(req)) {
    res.send(403);
    return;
  }

  if (req.body.token !== undefined) {
    var Screen = require('../lib/screen')
    var instance = new Screen(req.body.token);
    instance.load();
    instance.on('loaded', function() {
      instance.set('name', req.body.name);
      instance.set('screenGroups', req.body.groups);

      // Save the updates.
      instance.save();
      instance.on('saved', function() {
        // Save completed.
        res.send(200);

        // Reload screen to update groups.
        instance.reload();
      });

      // Handle error events.
      instance.on('error', function(data) {
        console.log(data.code + ': ' + data.message);
        res.send(500);
      });
    });
  }
  else {
    res.send(500);
  }
}

/**
 * Implements screen reload.
 *
 * Loads the screen based on screenID and sends reload command.
 */
exports.screenReload = function screenReload(req, res) {
  if (!accessCheck(req)) {
    res.send(403);
    return;
  }

  // Reload base on screens.
  if (req.body.screens !== undefined) {
    // Get screen class.
    var screens = require('../lib/screens');

    var len = req.body.screens.length;
    for (var i = 0; i < len; i++) {
      var token = req.body.screens[i];

      // Get screen.
      var instance = screens.get(token);
      if (instance) {
        instance.reload();
      }

      instance.on('error', function(data) {
        // @todo send result back.
        console.log(screens[screenID] + ': ' + data.code + ' - ' + data.message);
      });
    }

    res.send(200);
  }
  // Reload based on groups.
  else if (req.body.groups !== undefined) {
    var groups = req.body.groups;
    var connection = require('../lib/connection');
    connection.boardcast(groups, 'reload', {});

    res.send(200);
  }
  else {
    res.send(500);
  }
}

/**
 * Implements screen delete.
 *
 * Removes the screen form local cache (forced reload from backend).
 */
exports.screenRemove = function screenRemove(req, res) {
  if (!accessCheck(req)) {
    res.send(403);
    return;
  }

  if (req.body.token !== undefined) {
    // Load the screen and remove it.
    var screens = require('../lib/screens');
    var token = req.body.token;

    var instance = screens.get(token);
    if (instance === undefined) {
      // Screen may exists in cache even if it not active.
      var Screen = require('../lib/screen');
      instance = new Screen(token);

      // Load it before removeing it to get socket connection.
      instance.load();
      instance.on('loaded', function() {
        instance.remove();
      });
    }
    else {
      // Active screen remove it.
      instance.remove();
    }

    // Screen has been removed.
    instance.on('removed', function() {
      res.send(200);
    });

    // Handle errors in screen removale.
    instance.on('error', function(data) {
      // @todo send result back.
      res.send(data.code);
    });
  }
}

/**
 * Implements push channel content.
 */
exports.pushChannel = function pushChannel(req, res) {
  if (!accessCheck(req)) {
    res.send(403);
    return;
  }

  if (req.body.channelID !== undefined) {
    // Create new channel object.
    var Channel = require('../lib/channel');
    var instance = new Channel(req.body.channelID);

    // Add content.
    instance.set('content', req.body.channelContent);

    // Add groups.
    instance.set('groups', req.body.groups);

    // Cache channel (save in redis).
    instance.save();
    instance.on('saved', function() {
      // Save completed.
      res.send(200);

      // Push content to screens.
      instance.push();
    });

    // Handle error events.
    instance.on('error', function(data) {
      res.send(500);
    });
  }
  else {
    res.send(500);
  }
}

/**
 * Implements emergency content push.
 */
exports.pushEmergency = function pushEmergency(req, res) {
  if (!accessCheck(req)) {
    res.send(403);
    return;
  }

  res.send(501);
}

/**
 * Implements status request.
 */
exports.status = function status(req, res) {
  if (!accessCheck(req)) {
    res.send(403);
    return;
  }

  // Check parameter exists.
  if (req.body.screens !== undefined) {
    var status = {};
    var tokens = req.body.screens;

    var cache = require('./../lib/cache');
    cache.hashGetAllFields('screen:heartbeats', tokens, function(err, data) {
      if (err) {
        res.send(501);
      }

      // Link tokens and timestamps.
      var status = {};
      var len = data.length;
      for (var i = 0; i < len; i++) {
        // If tokens don't have a hash value it returns null.
        if (data[i] !== null) {
          var info = JSON.parse(data[i]);
          status[info.token] = info.time;
        }
      }

      // Send them back.
      res.send(status);
    });
  }
  else {
    res.send(500);
  }
}

/**
 * Implements status get all request.
 */
exports.statusAll = function statusAll(req, res) {
  if (!accessCheck(req)) {
    res.send(403);
    return;
  }

  var cache = require('./../lib/cache');
  cache.hashGetAll('screen:heartbeats', function(err, data) {
    if (err) {
      res.send(501);
    }

    for (var token in data) {
      var info = JSON.parse(data[token]);
      status[token] = {
        "time": info.time,
        "name": info.name
      };
    }

    // Close redis connection.
    cache.quit();

    // Send them back.
    res.send(status);
  });
}
