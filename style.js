#!/usr/bin/env node
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

var style = function(cartoCss) {
    return new CartoMML(cartoCss).xml;
};

if (require.main === module) {
    process.stdin.setEncoding("utf8");

    process.stdin.on("readable", function() {
        var line = process.stdin.read();
        if (line !== null) {
            var xml = style(line).replace(/(?:\r\n|\r|\n)/g, "");
            process.stdout.write(xml + "\n");
        }
    });
} else {
    module.exports.style = style;
}
