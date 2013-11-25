module.exports = function (request) {
  return {
    get: function (name, callback) {
      request('GET', ['/frontends', name].join('/'), null, callback);
    },
    list: function (callback) {
      request('GET', '/frontends', null, callback);
    },
    create: function (frontend, callback) {
      request('POST', '/frontends', frontend, callback);
    },
    delete: function (name, callback) {
      request('DELETE', ['/frontends', name].join('/'), null, callback);
    }
  };
};
