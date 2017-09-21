/**
 * SIP2 proxy to capture messages for analyses by recommender service.
 *
 */
'use strict';

var debug = require('debug')('sip2-proxy');
var fs = require('fs');

var https = require('https');
var httpProxy = require('http-proxy');

// Used to parse the body.
var getRawBody = require('raw-body');
var contentType = require('content-type');

// Load config file.
var config = require(__dirname + '/config.json');

// Create a proxy.
var proxy = httpProxy.createProxyServer({
	xfwd: false,
  changeOrigin: true,
  secure: false
});

// Start HTTPS server to receive requests.
https.createServer({
    key: fs.readFileSync(config.ssl.key, 'utf8'),
    cert: fs.readFileSync(config.ssl.crt, 'utf8')
  }, function (req, res) {
    // Proxy the request without delay.
    proxy.web(req, res, { target: config.target });

    // Parse the request to get the SIP2 messages.
    getRawBody(req, {
      length: req.headers['content-length'],
      limit: '1mb',
      encoding: contentType.parse(req).parameters.charset
    }, function (err, string) {
      if (err) {
        debug('Body parser error');
        return
      }

      // For now log the request to console.
      console.log('RAW request from the target', string.toString('utf8'));
    })
}).listen(config.port);

debug('Proxy started at port "' + config.port + '" with target "' + config.target + '"');

// Listen for the `error` event on `proxy`.
proxy.on('error', function (err, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  debug('Proxy error', err);

  res.end('Something went wrong. And we are reporting a custom error message.');
});
