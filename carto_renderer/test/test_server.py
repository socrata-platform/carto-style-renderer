# pylint: disable=missing-docstring,line-too-long,import-error
from hypothesis import assume, given
from hypothesis.strategies import integers, sampled_from

from carto_renderer import service
from carto_renderer.service import CssRenderer, build_wkt


def test_render_css():
    expected = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE Map[]><Map><Style name="main" filter-mode="first"><Rule><MarkersSymbolizer stroke="#0000cc" width="1" /></Rule></Style><Layer name="main"><StyleName>main</StyleName></Layer></Map>\n'  # noqa
    oneline = "#main{marker-line-color:#00C;marker-width:1}"
    multiline = """#main{
    marker-line-color:#00C;
    marker-width:1
    } """

    renderer = CssRenderer()
    assert renderer.render_css(oneline) == expected
    assert renderer.render_css(multiline) == expected


def test_ensure_renderer():
    renderer = CssRenderer()
    expected = renderer.renderer
    renderer.ensure_renderer()

    actual = renderer.renderer
    assert actual == expected


@given(integers())
def test_build_wkt_invalid(geom_code):
    unused = []

    assume(geom_code not in service.GEOM_TYPES)
    wkt = build_wkt(geom_code, unused)
    assert wkt is None
