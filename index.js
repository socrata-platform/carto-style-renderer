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
app.use(bodyParser.text());
app.use(errorHandler);

/**
 * Wrap `styledata` in an object suitable for rendering, and render it
 * to xml.
 * @constructor
 */
function CartoMML(styleData) {
  var renderer = new carto.Renderer();

  var layer = {};
  layer.name = 'main';
  layer.id = 'main';
  layer.geometry = 'point';
  layer['srs-name'] = '900913';
  layer.advanced = {};
  layer.class = '';

  this.Layer = [ layer ];
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
  res.send(style(req.query.style));
}));

if (require.main === module) {
  app.listen(PORT);
  baseLogger.info('Server running on localhost: ' + PORT);
} else {
  module.exports = {
    'style': style
  };
}
