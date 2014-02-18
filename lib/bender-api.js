var jsonquest = require('jsonquest');

var errors = {
  500: 'Internal Server Error'
};

function noop() {};

var Bender = module.exports = function (options) {
  if (!(this instanceof Bender)) {
    return new Bender(options);
  }

  var opts = options || {
    servers: [ { host: '127.0.0.1', port: 1729 } ]
  };

  this.servers = opts.servers;
  this.retries = opts.retries || 5;
};

Bender.prototype.request = function (method, url, body, callback) {
  var self = this;
  var cb = callback || noop;
  var retries = self.retries;

  function tryRequest() {
    var server = self.servers.shift();
    self.servers.push(server);

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
      return retries-- === 0 ? cb(err) : tryRequest();
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
};

Bender.prototype.register = function (options, callback) {
  var url = ['/registrations', options.app, options.version, options.host, options.port].join('/');
  return this.request('POST', url, null, callback);
};

Bender.prototype.getRegistrations = function () {
  var url = ['/registrations'];
  var callback = arguments[arguments.length - 1];
  var version, app;

  if (arguments.length > 1) {
    app = arguments[0];
    if (arguments.length > 2) {
      version = arguments[1];
    }
  }

  app && url.push(app) && version && url.push(version);
  return this.request('GET', url.join('/'), null, callback);
};

Bender.prototype.getFrontend = function (frontend, callback) {
  return this.request(
    'GET',
    ['/frontends', frontend.name || frontend].join('/'),
    null,
    callback
  );
};

Bender.prototype.getFrontends = function (callback) {
  return this.request('GET', '/frontends', null, callback);
};

Bender.prototype.createFrontend = function (frontend, callback) {
  return this.request('POST', '/frontends', frontend, callback);
};

Bender.prototype.removeFrontend = function (frontend, callback) {
  return this.request(
    'DELETE',
    ['/frontends', frontend.name || frontend].join('/'),
    null,
    callback
  );
};

Bender.prototype.getBackend = function (backend, callback) {
  return this.request(
    'GET',
    ['/backends', backend.name || backend].join('/'),
    null,
    callback
  );
};

Bender.prototype.getBackends = function (callback) {
  return this.request('GET', '/backends', null, callback);
};

Bender.prototype.createBackend = function (backend, callback) {
  return this.request('POST', '/backends', backend, callback);
};

Bender.prototype.updateBackend = function (backend, update, callback) {
  return this.request(
    'PUT',
    ['/backends', backend.name || backend].join('/'),
    update,
    callback
  );
};

Bender.prototype.removeBackend = function (backend, callback) {
  return this.request(
    'DELETE',
    ['/backends', backend.name || backend].join('/'),
    null,
    callback
  );
};

Bender.prototype.startRegistering = function (options, interval) {
  var self = this;

  self.register(options, function () {});

  interval = interval || 2000;
  return setInterval(function () {
    self.register(options, function () {});
  }, interval);
};

Bender.prototype.stopRegistering = function (id) {
  clearInterval(id);
};
