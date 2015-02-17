#!/usr/bin/env node
"use strict";

var PORT = 4096;

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
app.use(bodyParser.text());
app.use(errorHandler);

app.post("/style", function(req, res) {
    res.status(200);
    res.send(new CartoMML(req.body).xml);
});

function Point(x, y, properties) {
    this.x = x;
    this.y = y;
    this.properties = properties || { count: 1 };
}

app.post("/render", function(req, res) {
    var xml = new CartoMML(req.body).xml;

    var feat00 = new Point(0, 0),
        feat22 = new Point(20, 20),
        feat44 = new Point(40, 40);

    var ds = new mapnik.MemoryDatasource({"extent": "0,0,255,255"});
    ds.add(feat00);
    ds.add(feat22);
    ds.add(feat44);

    var map = new mapnik.Map(256, 256);
    map.fromStringSync(xml);

    var layer = new mapnik.Layer("main");
    layer.srs = map.srs;
    layer.styles = ["main"];
    layer.datasource = ds;
    map.add_layer(layer);

    map.zoomToBox([0, 0, 255, 255]);
    // map.zoomAll();

    res.type("png");
    res.send(map.renderSync("png"));
});

app.listen(PORT);

console.log("Server running on localhost: " + PORT);
