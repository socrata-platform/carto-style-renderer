#!/usr/bin/env node
'use strict';

var PORT = 4097;

var bodyParser = require('body-parser');
var carto = require('carto');
var express = require('express');
var fs = require('fs');

/*eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}
/*eslint-enable */

var app = express();
app.use(bodyParser.text());
app.use(errorHandler);

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

function version(req, res) {
  fs.readFile('package.json', 'utf8', function(err, data) {
    var ver = (err) ? 'UNKNOWN' : JSON.parse(data).version;
    var payload = {health: 'alive', version: ver};
    res.status(200);
    res.send(payload);
  });
}

app.get('/version', version);
app.post('/style', function(req, res) {
  res.status(200);
  res.send(new CartoMML(req.body).xml);
});

app.listen(PORT);
console.log('Server running on localhost: ' + PORT);
