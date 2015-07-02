# pylint: disable=missing-docstring,line-too-long

from carto_renderer import server


def test_render_css():
    expected = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE Map[]><Map><Style name="main" filter-mode="first"><Rule><MarkersSymbolizer stroke="#0000cc" width="1" /></Rule></Style><Layer name="main"><StyleName>main</StyleName></Layer></Map>\n'  # noqa
    oneline = "#main{marker-line-color:#00C;marker-width:1}"
    multiline = """#main{
    marker-line-color:#00C;
    marker-width:1
    } """

    assert server.render_css(oneline) == expected
    assert server.render_css(multiline) == expected


def test_parse_tile():
    pass
