"use strict";

var carto = require("carto");

function CartoMML(styleData) {
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

    var xml = renderer.render(this).toString();
    xml = xml.replace(/<Layer[\s\S]*>[\s\S]*<\/Layer>/, "");
    xml = xml.replace(/^\s*[\r\n]/gm, "");

    this.xml = xml;
}

module.exports = CartoMML;
