/*global suite, test */
"use strict";

var should = require("chai").should();

var index = require("../index");
var TILE_ZOOM_FACTOR = index.TILE_ZOOM_FACTOR,
    Point = index.Point,
    style = index.style,
    render = index.render;


var check = require("./simple-check");
var forAll = check.forAll;
var integer = check.integer;
var dictionary = check.dictionary;

var Feature = function(x, y, count, props) {
    this.x = x * TILE_ZOOM_FACTOR;
    this.y = y * TILE_ZOOM_FACTOR;
    this.properties = {};
    this.properties.count = count;
    this.properties.properties = JSON.stringify(props || {});
};

var Req = function() {
    this.body = this;
    this.style = "";
    // Hardcoded valid protobuffer.
    this.bpbf = "GoEBCgRtYWluEhASBAAAAQEYASIGCcA9gCECEhASBAACAQEYASIGCcAEwBkCEhASBAADAQEYASIGCcA9oCoCEhASBAAEAQEYASIGCYA/oCACGgVjb3VudBoKcHJvcGVydGllcyIDCgE2IgQKAnt9IgMKATEiAwoBOSIECgIxNiiAIHgB";
};

var Res = function(code, mime, xml) {
    this.status = function(actual) {
        (actual).should.equal(code);
    };

    this.type = function(actual) {
        (actual).should.equal(mime);
    };

    this.send = function() {
        return xml;
    };
};

Feature.prototype.loadGeometry = function() {
    return [[this]];
};

suite("Point represents provided feature", function() {
    test("x and y are extracted", function() {
        forAll(integer, integer, function(x, y) {
            var feat = new Feature(x, y);
            var pt = new Point(feat);

            (pt.x).should.equal(x);
            (pt.y).should.equal(y);
        });
    });

    test("count is extracted", function() {
        forAll(integer, integer, integer, function(x, y, count) {
            var feat, pt;
            // Top level.
            feat = new Feature(x, y, count);
            pt = new Point(feat);

            (pt.properties.count).should.equal(count);

            // Included in properties.
            feat = new Feature(x, y, null, { count: count });
            pt = new Point(feat);

            (pt.properties.count).should.equal(count);
        });
    });

    test("properties are extracted", function() {
        var re = /(^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$)|(^[+-]?[0-9]+\.$)/;

        forAll(dictionary, function(props) {
            var feat = new Feature(null, null, null, props);
            var pt = new Point(feat);
            for (var k in props) {
                if (re.test(props[k])) {
                    (pt.properties[k]).should.equal(Number(props[k]));
                } else {
                    (pt.properties[k]).should.equal(props[k]);
                }
            }
        });
    });
});

suite("style", function() {
    test("returns 200, application/xml", function() {
        style(new Req(), new Res(200, "application/xml"));
    });

    test("returns expected xml", function () {
        var expected = "";

        style(new Req(), new Res(200, "application/xml", expected));
    });

    test("rejects requests without body.style", function() {
        style({}, null);
    });
});

suite("render", function() {
    test("returns 200, image/png", function() {
        render(new Req(), new Res(200, "image/png"));
    });
});
