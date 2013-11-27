var jsonquest = require('jsonquest');

var errors = {
  500: 'Internal Server Error'
};

function noop() {};

module.exports = function (options) {
  var opts = options || {};
  var host = opts.host || 'localhost';
  var port = opts.port || 1729;

  function request(method, url, body, callback) {
    var cb = callback || noop;

    jsonquest({
      method: method,
      host: host,
      port: port,
      path: url,
      body: body
    }, function (err, res, body) {
      var msg;

      if (err) {
        return cb(err);
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        msg = 'bender error (' + res.statusCode + '): ';
        msg += (body && typeof body.message === 'string')
          ? body.message
          : errors[res.statusCode];

        err = new Error(msg);
        if (body.code) {
          err.code = body.code;
        }
        err.statusCode = res.statusCode;
        return cb(err);
      }

      return cb(null, body);
    });
  }

  return {
    registrations: require('./registrations')(request),
    frontends: require('./frontends')(request),
    backends: require('./backends')(request)
  };
};
