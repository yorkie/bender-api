var jsonquest = require('jsonquest');

var errors = {
  500: 'Internal Server Error'
};

function noop() {};

module.exports = function (options) {
  var opts = options || {
    servers: [ { host: '127.0.0.1', port: 1729 } ]
  };

  var servers = opts.servers;

  function request(method, url, body, callback) {
    var cb = callback || noop;
    var retries = opts.retries || 5;

    function tryRequest() {
      var server = servers.shift();
      servers.push(server);

      jsonquest({
        method: method,
        host: server.host,
        port: server.port || 1729,
        path: url,
        body: body
      }, done);
    }

    function done(err, res, body) {
      var msg;

      if (err) {
        return retries-- === 0
          ? cb(err)
          : tryRequest();
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

      cb(null, body);
    }

    tryRequest();
  }

  return {
    register: require('./register')(request),
    registrations: require('./registrations')(request),
    frontends: require('./frontends')(request),
    backends: require('./backends')(request)
  };
};
