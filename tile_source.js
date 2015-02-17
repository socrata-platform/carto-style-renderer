"use strict";

var request = require("request");

function TileSource(uri, headers) {
    this.uri = uri;
    this.headers = headers;
}

var defaultHandler = function(error, response, body) {
    if (!error && response.statusCode === 200) {
        console.log(body);
    } else {
        console.log(error);
    }
};

TileSource.prototype.wrap = function(uri) {
    return {
        uri: uri,
        headers: this.headers
    };
};

TileSource.prototype.getTile = function(z, x, y, callback) {
    var handler = callback || defaultHandler;
    var uri = this.uri.
            replace(/{z}/, z).
            replace(/{x}/, x).
            replace(/{y}/, y);

    request(this.wrap(uri), handler);
};

module.exports = TileSource;
