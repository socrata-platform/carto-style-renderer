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

/**
 Create a well formed point object from a feature.
 @param a deserialized feature.
 @class
 */
var Point = function(feature) {
    var loc = feature.loadGeometry()[0][0];
    this.x = loc.x / TILE_ZOOM_FACTOR;
    this.y = loc.y / TILE_ZOOM_FACTOR;
    var count = feature.properties.count;
    var props = JSON.parse(feature.properties.properties);
    this.properties = {};

    for (var key in props) {
        var prop = props[key];
        var num = Number(prop);
        var float = parseFloat(prop);

        this.properties[key] = (isNaN(num) || isNaN(float)) ? prop : num;
    }

    var ct = (typeof count === "number") ? count : this.properties.count;
    this.properties.count = parseInt(ct, 10);
};

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

var BadRequestError = function(message) {
    this.name = "BadRequestError";
    this.message = (message || "unknown error.");
};

BadRequestError.prototype = Object.create(Error.prototype);
BadRequestError.prototype.constructor = BadRequestError;
// TODO: Figure out how to properly construct a message?
BadRequestError.prototype.toString = function () {
    return this.name + ": " + this.message;
};

/*eslint-disable no-unused-vars */
var errorHandler = function(err, req, res, next) {
    if (err instanceof BadRequestError) {
        res.status(400);
    } else {
        res.status(500);
    }

    res.render("error", { error: err });
};
/*eslint-enable no-unused-vars */

var app = express();
app.use(bodyParser.json());
app.use(errorHandler);

var style = function(req, res) {
    if (typeof req.body === typeof undefined) {
        throw new BadRequestError("Could not parse request.");
    }
    var xml = new CartoMML(req.body.style).xml;
    res.status(200);
    res.type("application/xml");
    res.send(xml);
};

app.post("/style", style);

var render = function(req, res) {
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

    res.type("image/png");
    res.status(200);
    var zoom = 1 << (BASE_ZOOM - parseInt(req.body.zoom, 10));
    res.send(map.renderSync("png", { "scale_denominator": zoom }));
};

app.post("/render", render);

if (require.main === module) {
    app.listen(PORT);

    console.log("Server running on localhost: " + PORT);
} else {
    module.exports.TILE_ZOOM_FACTOR = TILE_ZOOM_FACTOR;
    module.exports.Point = Point;
    module.exports.style = style;
    module.exports.render = render;
}
