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
    xml = xml.replace(CartoMML.joinLines, "");
    xml = xml.replace(CartoMML.collapseEmpty, "><");

    this.xml = xml;
}

CartoMML.joinLines = new RegExp(/(?:\r\n|\r|\n)/g);
CartoMML.collapseEmpty = new RegExp(/>\s*</g);

if (require.main === module) {
    process.stdin.setEncoding("utf8");

    process.stdin.on("readable", function() {
        var line = process.stdin.read();
        if (line !== null) {
            var xml = new CartoMML(line).xml;

            process.stdout.write(xml + "\n");
        }
    });
}
