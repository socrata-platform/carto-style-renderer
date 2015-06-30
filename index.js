#!/usr/bin/env node
"use strict";

var PORT = 4096;

// Variables for Vector Tiles.
var BASE_ZOOM = 29;
var TILE_ZOOM_FACTOR = 16;
var TILE_EXTENT = [0, 0, 255, 255];

// Geometry types.
// Currently we only support points.
var POINT = 1,
    LINE_STRING = 2,
    POLYGON = 3;

var CartoMML = require("./lib/carto_mml"),
    Pbf = require("pbf"),
    VectorTile = require("vector-tile").VectorTile,
    bodyParser = require("body-parser"),
    express = require("express"),
    mapnik = require("mapnik");

var extractProperties = function(feature) {
    var out = {};
    var props = JSON.parse(feature.properties.properties);
    var count = feature.properties.count;

    for (var key in props) {
        var prop = props[key];
        var num = Number(prop);
        var float = parseFloat(prop);

        out[key] = (isNaN(num) || isNaN(float)) ? prop : num;
    }

    out.count = parseInt(count, 10);

    return out;
};

/**
 Create a well formed point object from a feature.
 @param a deserialized feature.
 @class
 */
var Point = function(feature) {
    var loc = feature.loadGeometry()[0][0];
    this.x = loc.x / TILE_ZOOM_FACTOR;
    this.y = loc.y / TILE_ZOOM_FACTOR;

    this.properties = extractProperties(feature);
};

var Polygon = function(feature) {
    this.properties = extractProperties(feature);

    var rings = [];

    var geom = feature.loadGeometry();
    for (var g = 0; g < geom.length; g++) {
        var points = geom[g];
        var ring = [];
        for (var p = 0; p < points.length; p++) {
            ring.push(points[p]);
        }
        rings.push(ring);
    }

    /*eslint-disable camelcase */
    this.geometry = {};
    this.geometry.type = "Polygon";
    this.geometry.exterior_ring = rings[0];
    this.geometry.interior_rings = rings.slice(1);
    /*eslint-enable camelcase */
};

var extractFeatures = function(layer) {
    var ret = [];

    for (var i = 0; i < layer.length; i++) {
        ret.push(layer.feature(i));
    }

    return ret;
};

var makeFeature = function(raw) {
    switch (raw.type) {
    case POINT:
        return new Point(raw);
    case LINE_STRING:
        throw new Error("TODO: Support LINE_STRING");
    case POLYGON:
        return new Polygon(raw);
    default:
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
    var xml = new CartoMML(req.body.style || "").xml;

    var tileBytes = new Buffer(req.body.bpbf || "", "base64");
    var tile = new VectorTile(new Pbf(tileBytes));
    var main = tile.layers.main;

    var features = (main) ? extractFeatures(main).map(makeFeature) : [];

    var ds = new mapnik.MemoryDatasource({"extent": TILE_EXTENT.join()});
    features.forEach(function(ft) {
        ds.add(ft);
        ds.add({ wkt: "POINT(10 20)" });
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
    var zoom = 1 << (BASE_ZOOM - parseInt(req.body.zoom || 1, 10));
    res.send(map.renderSync({format: "png"}, { "scale_denominator": zoom }));
};

app.post("/render", render);

if (require.main === module) {
    app.listen(PORT);

    console.log("Server running on localhost:" + PORT);
} else {
    module.exports.TILE_ZOOM_FACTOR = TILE_ZOOM_FACTOR;
    module.exports.Point = Point;
    module.exports.style = style;
    module.exports.render = render;
}
