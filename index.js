#!/usr/bin/env node
"use strict";

var PORT = 2049;

// Variables for Vector Tiles.
var BASE_ZOOM = 29;
var TILE_ZOOM_FACTOR = 16;
var TILE_EXTENT = [0, 0, 255, 255];

// Geometry types.
// Currently we only support points.
var POINT = 1;

var CartoMML = require("./lib/carto_mml"),
    Pbf = require("pbf"),
    VectorTile = require("vector-tile").VectorTile,
    bodyParser = require("body-parser"),
    express = require("express"),
    mapnik = require("mapnik");


function Point(feature) {
    var loc = feature.loadGeometry()[0][0];
    this.x = loc.x / TILE_ZOOM_FACTOR;
    this.y = loc.y / TILE_ZOOM_FACTOR;
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

    var ds = new mapnik.MemoryDatasource({"extent": TILE_EXTENT.join()});
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

    map.zoomToBox(TILE_EXTENT);

    res.type("png");
    res.status(200);
    var zoom = 1 << (BASE_ZOOM - parseInt(req.body.zoom, 10));
    res.send(map.renderSync("png", { "scale_denominator": zoom }));
});

app.listen(PORT);

console.log("Server running on localhost: " + PORT);
