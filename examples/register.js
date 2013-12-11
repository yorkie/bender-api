var http = require('http');
var bender = require('../')();

http.createServer(function (req, res) {
  console.log('Got request!');
  res.writeHead(200, { 'content-type': 'text/html' });
  res.write('<h1>Hello world from ' + this.address().port + '!</h1>\n');
  res.end();
}).listen(function () {
  var port = this.address().port;
  var host = this.address().host || '127.0.0.1';
  setInterval(function () {
    bender.registrations.register({
      app: 'hello-world',
      version: '1.0.0',
      host: host,
      port: port
    });

    bender.registrations.list('hello-world', '1.0.0', function (err, registrations) {
      if (err) {
        console.error('Error: ' + err.message);
        return;
      }

      registrations = registrations.registrations;
      console.log('Registrations:');
      registrations.forEach(function (registration) {
        console.log('  ' + registration.host + ':' + registration.port);
      });
      console.log();
    });
  }, 3000);
});
