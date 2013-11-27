module.exports = function (request) {
  return {
    get: function (name, callback) {
      request('GET', ['/backends', name].join('/'), null, callback);
    },
    list: function (callback) {
      request('GET', '/backends', null, callback);
    },
    create: function (frontend, callback) {
      request('POST', '/backends', frontend, callback);
    },
    delete: function (name, callback) {
      request('DELETE', ['/backends', name].join('/'), null, callback);
    }
  };
};
