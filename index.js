#!/usr/bin/env node

var express = require('express'),
    bodyParser = require('body-parser'),
    carto = require('carto');

(function () {
    "use strict";

    var app = express();
    app.use(bodyParser.text());

    var CartoLayer = function (name, geometry) {
        this.name = name;
        this.id = name;
        this.geometry = geometry || "point";

        this['srs-name'] = "900913";
        this.advanced = {};
        this.class = '';
    };

    var CartoStyle = function (data) {
        // this.id = ...
        this.data = data;
    };

    var CartoMML = function (styleData) {
        this.Layer = [ new CartoLayer('main') ];
        this.Stylesheet = [ new CartoStyle(styleData) ];
    };

    var renderer = new carto.Renderer();

    var toMapnikXML = function (styleData) {
        return renderer.render(new CartoMML(styleData)).toString();
    };
    
    app.post("/style", function (req, res) {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.end(toMapnikXML(req.body));
    });

    app.listen(4096);

    console.log("Server running on localhost:4096!");
})();
