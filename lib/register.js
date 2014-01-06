module.exports = function (request) {
  return function (options) {
    var self = this;

    function register() {
      self.registrations.register({
        app: options.app,
        version: options.version,
        host: options.host,
        port: options.port,
        meta: options.meta || {}
      }, function () {
      });
    }

    setInterval(register, options.interval);
    register();
  };
};
