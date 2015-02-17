#!/usr/bin/env node
"use strict";

var PORT = 4096;
var BASE_ZOOM = 29

var express = require("express"),
    bodyParser = require("body-parser"),
    mapnik = require("mapnik");

var CartoMML = require("./carto_mml");

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

function Point(x, y, properties) {
    this.x = x;
    this.y = y;
    this.properties = properties || { count: 1 };
}

app.post("/render", function(req, res) {
    var xml = new CartoMML(req.body.style).xml;

    var feat00 = new Point(3, 3),
        feat11 = new Point(100, 100, { count: 4 }),
        feat22 = new Point(200, 200);

    var ds = new mapnik.MemoryDatasource({"extent": "0,0,255,255"});
    ds.add(feat00);
    ds.add(feat11);
    ds.add(feat22);

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
