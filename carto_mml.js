"use strict";

var carto = require('carto');

var CartoMML = function (styleData) {
    var renderer = new carto.Renderer();

    var CartoLayer = function (name, geometry) {
        this.name = name;
        this.id = name;
        this.geometry = geometry || "point";

        this["srs-name"] = "900913";
        this.advanced = {};
        this.class = "";
    };

    var CartoStyle = function (data) {
        // this.id = <id> // we probably don't need this.
        this.data = data;
    };

    this.Layer = [ new CartoLayer("main") ];
    this.Stylesheet = [ new CartoStyle(styleData) ];
    this.xml = renderer.render(this).toString();
};

module.exports = CartoMML;
