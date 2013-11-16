module.exports = function (request) {
  return {
    register: function (options, callback) {
      var url = ['/registrations', options.app, options.version, options.host, options.port].join('/');
      request('POST', url, null, callback);
    },
    list: function (app, version, callback) {
      var url = ['/registrations', app, version].join('/');
      request('GET', url, null, callback);
    }
  };
};
