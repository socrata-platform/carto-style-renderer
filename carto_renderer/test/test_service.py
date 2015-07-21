# pylint: disable=missing-docstring,line-too-long,import-error,abstract-method
import json

from hypothesis import assume, given
from hypothesis.strategies import integers, lists, text
from pytest import raises
from tornado.web import RequestHandler

try:
    from unittest import mock   # pylint: disable=no-name-in-module
except ImportError:
    import mock

try:
    unicode
except NameError:     # pragma: no cover
    unicode = str     # pylint: disable=invalid-name,redefined-builtin

from carto_renderer import service, errors
from carto_renderer.service import CssRenderer, GEOM_TYPES, build_wkt

POINT_LISTS = lists(integers(), 2, 2, 2)
SHELL_LISTS = lists(POINT_LISTS, 1, 10, 100)


def render_pair(pair):
    assert len(pair) == 2
    return "{} {}".format(pair[0], pair[1])


class StrRenderer(object):
    # pylint: disable=too-few-public-methods
    def __init__(self, xml):
        self.xml = xml
        self.css = None

    def render_css(self, css):
        self.css = css
        return self.xml


class StringHandler(RequestHandler):
    # pylint: disable=super-init-not-called
    def __init__(self, **kwargs):
        super(StringHandler, self).__init__(mock.MagicMock(),
                                            mock.MagicMock(),
                                            **kwargs)
        self.written = []
        self.finished = False
        self.status_code = None
        self.status_reason = None
        self.request = self
        self.headers = {}
        self.body = None

    def clear(self):
        self.written = []

    def write(self, chunk):
        if chunk is not None:
            self.written.append(chunk)

    def finish(self, chunk=None):
        self.write(chunk)
        self.finished = True

    def set_status(self, code, reason=None):
        self.status_code = code
        self.status_reason = reason

    def was_written(self):
        return u''.join([unicode(s) for s in self.written])


class BaseStrHandler(service.BaseHandler, StringHandler):
    pass


class VersionStrHandler(service.VersionHandler, StringHandler):
    pass


class StyleStrHandler(service.StyleHandler, StringHandler):
    def __init__(self, renderer=None):
        StringHandler.__init__(self, css_renderer=renderer)
        self.jbody = None

    def extract_jbody(self):
        if self.jbody:
            return self.jbody
        else:
            return service.StyleHandler.extract_jbody(self)


class RenderStrHandler(service.RenderHandler, StringHandler):
    def __init__(self, renderer=None):
        StringHandler.__init__(self, css_renderer=renderer)


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

    assume(geom_code not in GEOM_TYPES)
    wkt = build_wkt(geom_code, unused)
    assert wkt is None


@given(POINT_LISTS)
def test_build_wkt_point(coordinates):
    coords = [[c * 16 for c in coordinates]]
    wkt = build_wkt(1, coords)
    assert wkt is not None
    assert wkt == 'POINT({})'.format(render_pair(coordinates))


@given(SHELL_LISTS)
def test_build_wkt_line_string(points):
    coords = [[c * 16 for c in coord] for coord in points]
    wkt = build_wkt(2, coords)
    assert wkt is not None
    point_str = ','.join([render_pair(p) for p in points])
    assert wkt == 'LINE_STRING(({}))'.format(point_str)


@given(lists(SHELL_LISTS, 1, 3, 100))
def test_build_wkt_line_polygon(shells):
    coords = [[[c * 16 for c in coord]
               for coord in points] for points in shells]
    wkt = build_wkt(3, coords)
    assert wkt is not None
    point_str = [','.join([render_pair(p) for p in points])
                 for points in shells]
    assert wkt == 'POLYGON((({})))'.format('),('.join(point_str))


def test_render_png():
    # patch: mapnik.render and mapnik.Image for testing here.
    # It's not quite blackbox testing, but should be much simpler than
    # having to deal with the output.
    assert "TODO" == True


@given(text(), integers(), text())
def test_base_handler(message, status, body):
    # pylint: disable=no-member,protected-access
    base = BaseStrHandler()

    service_err = errors.ServiceError(message, status, request_body=body)
    base._handle_request_exception(service_err)

    assert base.status_code == status
    assert json.dumps(message) in base.was_written()
    if body:
        assert json.dumps(body) in base.was_written()

    runtime_err = RuntimeError(message)
    base._handle_request_exception(runtime_err)
    assert base.status_code == 500
    assert json.dumps(message) in base.was_written()


def test_version_handler():
    ver = VersionStrHandler()
    ver.get()                   # pylint: disable=no-member
    assert 'health' in ver.was_written()
    assert 'alive' in ver.was_written()
    assert 'version' in ver.was_written()
    assert ver.finished


def test_base_handler_bad_req():
    # pylint: disable=no-member

    with raises(errors.BadRequest) as no_ct:
        base = BaseStrHandler()
        base.extract_jbody()
    assert "invalid content-type" in no_ct.value.message.lower()

    with raises(errors.BadRequest) as bad_ct:
        base = BaseStrHandler()
        base.request.headers['content-type'] = 'unexpected type!'
        base.extract_jbody()
    assert "invalid content-type" in bad_ct.value.message.lower()

    with raises(errors.BadRequest) as bad_json:
        base = BaseStrHandler()
        base.request.headers['content-type'] = 'application/json'
        base.extract_jbody()
    assert "could not parse" in bad_json.value.message.lower()


def test_style_handler_bad_req():
    with raises(errors.JsonKeyError) as no_key:
        style = StyleStrHandler()
        style.request.headers['content-type'] = 'application/json'
        style.body = '{}'
        style.post()
    assert "style" in no_key.value.message.lower()


def test_render_handler_bad_req():
    keys = ["bpbf", "zoom", "style"]

    with raises(errors.JsonKeyError) as empty_json:
        render = RenderStrHandler()
        render.request.headers['content-type'] = 'application/json'
        render.body = '{}'
        render.post()
    for k in keys:
        assert k in empty_json.value.message.lower()

    with raises(errors.JsonKeyError) as no_style:
        render = RenderStrHandler()
        render.request.headers['content-type'] = 'application/json'
        render.body = '{"zoom": "", "body": ""}'
        render.post()
    for k in keys:
        assert k in no_style.value.message.lower()

    with raises(errors.JsonKeyError) as no_zoom:
        render = RenderStrHandler()
        render.request.headers['content-type'] = 'application/json'
        render.body = '{"style": "", "bpbf": ""}'
        render.post()
    for k in keys:
        assert k in no_zoom.value.message.lower()

    with raises(errors.JsonKeyError) as no_bpbf:
        render = RenderStrHandler()
        render.request.headers['content-type'] = 'application/json'
        render.body = '{"style": "", "zoom": ""}'
        render.post()
    for k in keys:
        assert k in no_bpbf.value.message.lower()

    with raises(errors.BadRequest) as bad_zoom:
        render = RenderStrHandler()
        render.request.headers['content-type'] = 'application/json'
        render.body = '{"style": "", "zoom": "", "bpbf": ""}'
        render.post()
    assert "zoom" in bad_zoom.value.message.lower()
    assert "int" in bad_zoom.value.message.lower()


@given(text(), text())
def test_style_handler(jbody, xml):
    # pylint: disable=attribute-defined-outside-init
    renderer = StrRenderer(xml)
    style = StyleStrHandler(renderer=renderer)
    style.jbody = {'style': jbody}
    style.post()

    assert xml == style.was_written()
    assert style.finished
