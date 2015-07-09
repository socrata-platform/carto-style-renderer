#!/usr/bin/env python
"""
Service to render pngs from vector tiles using Carto CSS.
"""
# Pylint appears to not like something about my PYTHONPATH.
# pylint: disable=import-error
import mapnik
import mapbox_vector_tile
from tornado.ioloop import IOLoop
from tornado.web import Application, RedirectHandler, RequestHandler, url
# pylint: enable=import-error

import json
import logging
import collections
import base64

from subprocess import Popen, PIPE

from carto_renderer.errors import BadRequest, JsonKeyError, ServiceError

# Variables for Vector Tiles.
BASE_ZOOM = 29
TILE_ZOOM_FACTOR = 16


def render_css(carto_css, renderers=None):
    """
    Transform Carto CSS into Mapnik XML.

    Carto CSS must be formatted on a single line, ending in a line break.
    """
    renderer = None

    if not renderers:
        renderers = []

    if len(renderers) == 0 or not renderers[0].poll():
        renderer = Popen(['node', 'style'],
                         stdin=PIPE,
                         stdout=PIPE,
                         stderr=PIPE)
        renderers.append(renderer)

    renderer.stdin.write(carto_css)
    return renderer.stdout.readline()


GEOM_TYPES = {
    0: 'UNKNOWN',
    1: 'POINT',
    2: 'LINE_STRING',
    3: 'POLYGON'
    }


def build_wkt(geom_code, geometries):
    """
    Build a Well Known Text of the appropriate type.

    Returns None on failure.
    """
    geom_type = GEOM_TYPES.get(geom_code, 0)

    def collapse(coords):       # pylint: disable=missing-docstring
        if len(coords) < 1:
            return '()'

        first = coords[0]
        if not isinstance(first, collections.Iterable):
            return " ".join([str(c / TILE_ZOOM_FACTOR) for c in coords])
        else:
            return '({})'.format(','.join([collapse(c) for c in coords]))

    collapsed = collapse(geometries)

    if geom_type == 'UNKNOWN':
        logging.warn('Unknown geometry code: %s', geom_code)
        return None

    if geom_type != 'POINT':
        collapsed = '({})'.format(collapsed)

    return geom_type + collapsed


def render_png(tile, zoom, xml):
    """
    Render the tile for the given zoom
    """
    ctx = mapnik.Context()

    map_tile = mapnik.Map(256, 256)
    scale_denom = 1 << (BASE_ZOOM - int(zoom or 1))
    scale_factor = scale_denom / map_tile.scale_denominator()

    map_tile.zoom(scale_factor)  # TODO: Is overriden by zoom_to_box.
    mapnik.load_map_from_string(map_tile, xml)
    map_tile.zoom_to_box(mapnik.Box2d(0, 0, 255, 255))

    for (name, features) in tile.items():
        name = name.encode('ascii', 'ignore')
        source = mapnik.MemoryDatasource()
        map_layer = mapnik.Layer(name)
        map_layer.datasource = source

        for feature in features:
            wkt = build_wkt(feature['type'], feature['geometry'])
            feat = mapnik.Feature(ctx, 0)
            if wkt:
                try:
                    feat.add_geometries_from_wkt(wkt)
                except RuntimeError:
                    logging.warn("Failed to parse WKT: %s", wkt)
            source.add_feature(feat)

        map_layer.styles.append(name)
        map_tile.layers.append(map_layer)

    image = mapnik.Image(map_tile.width, map_tile.height)
    mapnik.render(map_tile, image)

    return image.tostring("png")


# pylint: disable=no-init,too-few-public-methods,no-member
class BaseHandler(RequestHandler):
    """
    Convert ServiceErrors to HTTP errors.
    """
    def _handle_request_exception(self, err):
        """
        Convert ServiceErrors to HTTP errors.
        """
        payload = {}
        if isinstance(err, ServiceError):
            status_code = err.status_code
            print(err.request_body)
            if err.request_body:
                payload['request_body'] = err.request_body
        else:
            status_code = 500

        payload['resultCode'] = status_code
        payload['message'] = err.message

        self.clear()
        self.set_status(status_code)
        self.write(payload)
        self.finish()


class VersionHandler(BaseHandler):
    """
    Return the version of the service, currently hardcoded.
    """
    version = {'health': 'alive', 'version': '0.0.1'}

    def get(self):
        """
        Return the version of the service, currently hardcoded.
        """
        self.write(VersionHandler.version)
        self.finish()


class StyleHandler(BaseHandler):
    """
    Convert Carto CSS passed in via the `$style` query param
    into Mapnik XML.
    """
    def post(self):
        """
        Convert Carto CSS passed in via the `$style` query param
        into Mapnik XML.
        """
        body = self.request.body

        try:
            jbody = json.loads(body)
        except ValueError:
            jbody = None

        if not jbody:
            raise BadRequest("Could not parse JSON.", body)

        if 'style' in jbody:
            self.write(render_css(jbody['style']))
            self.finish()
        else:
            raise JsonKeyError('style', jbody)


class RenderHandler(BaseHandler):
    """
    Actually render the png.

    Expects a JSON blob with 'style', 'zoom', and 'bpbf' values.
    """
    def post(self):
        """
        Actually render the png.

        Expects a JSON blob with 'style', 'zoom', and 'bpbf' values.
        """
        body = self.request.body

        try:
            jbody = json.loads(body)
        except ValueError:
            jbody = None

        if not jbody:
            raise BadRequest("Could not parse json.", bad_input=body)

        keys = ['bpbf', 'zoom', 'style']

        if not all([k in jbody for k in keys]):
            raise JsonKeyError(keys, jbody)
        else:
            try:
                zoom = int(jbody['zoom'])
            except:
                raise BadRequest("'zoom' must be an integer.")
            pbf = base64.b64decode(jbody['bpbf'])
            tile = mapbox_vector_tile.decode(pbf)
            xml = render_css(jbody['style'])
            self.write(render_png(tile, zoom, xml))
            self.finish()


def main():
    """
    Actually fire up the web server.

    Listens on 4096.
    """
    routes = [
        url(r'/', RedirectHandler, {'url': '/version'}),
        url(r'/version', VersionHandler),
        url(r'/style', StyleHandler),
        url(r'/render', RenderHandler),
    ]

    app = Application(routes)
    app.listen(4096)
    IOLoop.current().start()

if __name__ == "__main__":
    main()
