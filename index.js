#!/usr/bin/env node
'use strict';

var PORT = 4097;

var bodyParser = require('body-parser');
var bunyan = require('bunyan');
var carto = require('carto');
var crypto = require('crypto');
var express = require('express');
var fs = require('fs');

var baseLogger = bunyan.createLogger({
  name: 'carto-style-renderer'
});

/*eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  res.status(500);
  baseLogger.warn(err);
  res.render('error', { error: err });
}
/*eslint-enable */

var app = express();
// app.use(bodyParser.text());
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '10mb'
}));
app.use(errorHandler);

/**
 * Wrap `styledata` in an object suitable for rendering, and render it
 * to xml.
 * @constructor
 */
function CartoMML(styleData) {
  var renderer = new carto.Renderer();

  var matches = styleData.match(/#([A-Za-z0-9#]+,?\s*)+[{]/g);
  var split = matches.map(function(m) { return m.split(','); });
  var merged = [].concat.apply([], split);

  this.Layer = merged.map(function(m) {
    var name = m.replace('#', '').replace(/\s*{$/, '').trim();
    return { 'name': name };
  });

  this.Stylesheet = [ { data: styleData } ];

  this.xml = renderer.render(this).toString() + '\n';
}

/** Convert Carto CSS to Mapnik XML. */
function style(cartoCss) {
  return new CartoMML(cartoCss).xml;
}

/** Return a JSON blob containing the version. */
var version = (function() {
  var ver;
  var buildTime;

  try {
    var data = fs.readFileSync('package.json', 'utf8');
    ver = JSON.parse(data).version;
  } catch (e) {
    ver = 'UNKNOWN';
  }

  try {
    buildTime = fs.readFileSync('build-time.txt', 'utf8').trim();
  } catch (e) {
    buildTime = 'UNKNOWN';
  }

  return function() {
    return {health: 'alive',
            version: ver,
            nodejsVersion: process.version,
            buildTime: buildTime
           };
  };
})();

/** Wrapper around a handler, adds logging including response time. */
function log(handler) {
  return function(req, res) {
    var start = new Date().getTime();

    handler(req, res);

    var end = new Date().getTime();
    var delta = end - start;

    var reqId = req.header('X-Socrata-RequestId') ||
          crypto.randomBytes(16).toString('base64');

    var logger = baseLogger.child({
      responseTime: delta,
      'X-Socrata-RequestId': reqId
    });

    logger.info('Success!');
  };
}

app.get('/version', log(function(req, res) {
  res.status(200);
  res.send(version());
}));

app.get('/style', log(function(req, res) {
  res.status(200);
  res.set('Content-Type', 'text/xml');
  var buf = new Buffer(req.query.style, 'base64');
  res.send(style(buf.toString('utf8')));
}));

app.post('/style', log(function(req, res) {
  res.status(200);
  res.set('Content-Type', 'text/xml');
  var buf = new Buffer(req.body.style, 'base64');
  res.send(style(buf.toString('utf8')));
}));

if (require.main === module) {
  app.listen(PORT);
  baseLogger.info('Server running on localhost: ' + PORT);
} else {
  module.exports = {
    'style': style
  };
}
