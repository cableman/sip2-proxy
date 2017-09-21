var https = require('https');
var httpProxy = require('http-proxy');

var fs = require('fs');

// Load config file.
var config = require(__dirname + '/config.json');

const options = {
  key: fs.readFileSync('server.key', 'utf8'),
  cert: fs.readFileSync('server.crt', 'utf8')
};

// Create a proxy server with custom application logic
var proxy = httpProxy.createProxyServer({
	xfwd: true,
  changeOrigin: true,
  secure: false
});

https.createServer(options, function (req, res) {
  proxy.web(req, res, {
      target: 'https://linuxdev.dk'
   });

  console.log('RAW request from the target', JSON.stringify(req.headers, true, 2));

}).listen(config.port);

//
// Listen for the `error` event on `proxy`.
proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  res.end('Something went wrong. And we are reporting a custom error message.');
});

//
// Listen for the `proxyRes` event on `proxy`.
//
proxy.on('proxyRes', function (proxyRes, req, res) {
  console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
});

