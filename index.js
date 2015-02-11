#!/usr/bin/env node
"use strict";

var PORT = 4096;

var express = require("express"),
    bodyParser = require("body-parser"),
    Vector = require("tilelive-vector"),
    CartoMML = require("./carto_mml");

/*eslint-disable no-unused-vars */
var errorHandler = function (err, req, res, next) {
    res.status(500);
    res.render("error", { error: err });
};
/*eslint-enable */

var app = express();
app.use(bodyParser.text());
app.use(errorHandler);

app.post("/style", function (req, res) {
    res.status(200);
    res.send(new CartoMML(req.body).xml);
});

app.post("/render", function (req, res) {
    res.status(200);

    var xml = new CartoMML(req.body).xml;
    var vector = new Vector({xml: xml});
    console.log(vector.getInfo(function (info) {
        console.log(info);
    }));

    res.send(xml);
});

app.listen(PORT);

console.log("Server running on localhost: " + PORT);
