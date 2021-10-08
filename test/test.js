'use strict';

var chai = require('chai');
var expect = chai.expect;

var index = require('../index');
var style = index.style;

function collapse(xml) {
  return xml.
    replace(/(?:\r\n|\r|\n)/g, '').
    replace(/>\s*</g, '><');
}

describe('style()', function() {
  it('rendering CSS returns expected', function() {
    var expected = '<?xml version="1.0" encoding="utf-8"?>'
        + '<!DOCTYPE Map[]>'
        + '<Map>'
        + '<Style filter-mode="first" name="main">'
        + '<Rule>'
        + '<MarkersSymbolizer stroke="#0000cc" width="1" />'
        + '</Rule>'
        + '</Style>'
        + '<Layer name="main">'
        + '<StyleName><![CDATA[main]]></StyleName>'
        + '</Layer>'
        + '</Map>';

    var oneline = '#main{marker-line-color:#00C;marker-width:1}';
    var multiline = [
      '#main{',
      'marker-line-color:#00C;',
      'marker-width:1',
      '}'
    ].join('\n');

    expect(collapse(style(oneline))).to.equal(expected);
    expect(collapse(style(multiline))).to.equal(expected);
  });
});
