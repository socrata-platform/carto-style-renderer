#!/usr/bin/env node
"use strict";

var PORT = 4097;

var bodyParser = require("body-parser"),
    carto = require("carto"),
    express = require("express");

/*eslint-disable no-unused-vars */
var errorHandler = function(err, req, res, next) {
    res.status(500);
    res.render("error", { error: err });
};
/*eslint-enable */

var app = express();
app.use(bodyParser.text());
app.use(errorHandler);

var CartoMML = function(styleData) {
    var renderer = new carto.Renderer();

    var layer = {};
    layer.name = "main";
    layer.id = "main";
    layer.geometry = "point";
    layer["srs-name"] = "900913";
    layer.advanced = {};
    layer.class = "";

    this.Layer = [ layer ];
    this.Stylesheet = [ { data: styleData } ];

    this.xml = renderer.render(this).toString() + "\n";
};

app.post("/style", function(req, res) {
    res.status(200);
    res.send(new CartoMML(req.body).xml);
});

app.listen(PORT);
console.log("Server running on localhost: " + PORT);
