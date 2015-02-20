#!/usr/bin/env node
"use strict";

var PORT = 4096;
var BASE_ZOOM = 29;

// Geometry types.
var POINT = 1;

// Needed for "/style"
var bodyParser = require("body-parser"),
    express = require("express");
var CartoMML = require("./carto_mml");

// Needed for "/render"
var Pbf = require("pbf"),
    mapnik = require("mapnik"),
    VectorTile = require("vector-tile").VectorTile;

function Point(feature) {
    var loc = feature.loadGeometry()[0][0];
    this.x = loc.x / 16;
    this.y = loc.y / 16;
    var count = feature.properties.count;
    var props = JSON.parse(feature.properties.properties);
    this.properties = {};

    for (var key in props) {
        var float = parseFloat(props[key]);
        this.properties[key] = isNaN(float) ? props[key] : float;
    }

    this.properties.count = parseInt(count || this.properties.count, 10);
}

var extractFeatures = function(layer) {
    var ret = [];

    for (var i = 0; i < layer.length; i++) {
        ret.push(layer.feature(i));
    }

    return ret;
};

var makeFeature = function(raw) {
    if (raw.type === POINT) {
        return new Point(raw);
    } else {
        throw new Error("Unsupported geometry type: " + raw.type);
    }
};

/*eslint-disable no-unused-vars */
var errorHandler = function(err, req, res, next) {
    res.status(500);
    res.render("error", { error: err });
};
/*eslint-enable no-unused-vars */

var app = express();
app.use(bodyParser.json());
app.use(errorHandler);

app.post("/style", function(req, res) {
    var xml = new CartoMML(req.body.style).xml;
    res.status(200);
    res.type("application/xml");
    res.send(xml);
});

app.post("/render", function(req, res) {
    var xml = new CartoMML(req.body.style).xml;

    var tileBytes = new Buffer(req.body.bpbf, "base64");
    var tile = new VectorTile(new Pbf(tileBytes));
    var main = tile.layers.main;

    var features = extractFeatures(main).map(makeFeature);

    var ds = new mapnik.MemoryDatasource({"extent": "0,0,255,255"});
    features.forEach(function(ft) {
        ds.add(ft);
    });

    var map = new mapnik.Map(256, 256);
    map.fromStringSync(xml);

    var layer = new mapnik.Layer("main");
    layer.srs = map.srs;
    layer.styles = ["main"];
    layer.datasource = ds;
    map.add_layer(layer);

    map.zoomToBox([0, 0, 255, 255]);

    res.type("png");
    res.status(200);
    var zoom = 1 << (BASE_ZOOM - parseInt(req.body.zoom, 10));
    res.send(map.renderSync("png", { "scale_denominator": zoom }));
});

app.listen(PORT);

console.log("Server running on localhost: " + PORT);
