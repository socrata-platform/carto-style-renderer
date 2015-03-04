"use strict";

var carto = require("carto");

function CartoMML(styleData) {
    var renderer = new carto.Renderer();

    function CartoLayer(name, geometry) {
        this.name = name;
        this.id = name;
        this.geometry = geometry || "point";

        this["srs-name"] = "900913";
        this.advanced = {};
        this.class = "";
    }

    function CartoStyle(data) {
        this.data = data;
    }

    this.Layer = [ new CartoLayer("main") ];
    this.Stylesheet = [ new CartoStyle(styleData) ];

    var xml = renderer.render(this).toString();
    xml = xml.replace(/<Layer[\s\S]*>[\s\S]*<\/Layer>/, "");
    xml = xml.replace(/^\s*[\r\n]/gm, "");

    this.xml = xml;
}

module.exports = CartoMML;
