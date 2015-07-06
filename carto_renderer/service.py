#!/usr/bin/env python
"""
Service to render pngs from vector tiles using Carto CSS.
"""
import collections
import base64
import mapnik                   # pylint: disable=import-error
import mapbox_vector_tile       # pylint: disable=import-error

from flask import Flask, jsonify, make_response, redirect, request, url_for
from subprocess import Popen, PIPE

# pylint: disable=no-name-in-module
from errors import BadRequest, JsonKeyError, ServiceError
# pylint: enable=no-name-in-module

# All examples seem to use `app` not `APP`.
app = Flask(__name__)           # pylint: disable=invalid-name

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
    1: 'POINT',
    2: 'LINE_STRING',
    3: 'POLYGON'
    }


def build_wkt(geom_code, geometries):
    """
    Build a Well Known Text of the appropriate type.
    """
    geom_type = GEOM_TYPES[geom_code]

    def collapse(coords):       # pylint: disable=missing-docstring
        if len(coords) < 1:
            return '()'

        first = coords[0]
        if not isinstance(first, collections.Iterable):
            return " ".join([str(c / TILE_ZOOM_FACTOR) for c in coords])
        else:
            return '({})'.format(','.join([collapse(c) for c in coords]))

    return geom_type + collapse(geometries)


def render_png(tile, zoom, xml):
    """
    Render the tile for the given zoom
    """
    ctx = mapnik.Context()

    map_tile = mapnik.Map(256, 256)
    scale_denom = 1 << (BASE_ZOOM - int(zoom or 1))
    scale_factor = scale_denom / map_tile.scale_denominator()

    map_tile.zoom(scale_factor) # TODO: Is overriden by zoom_to_box.
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
            feat.add_geometries_from_wkt(wkt)
            source.add_feature(feat)

        map_layer.styles.append(name)
        map_tile.layers.append(map_layer)

    image = mapnik.Image(map_tile.width, map_tile.height)
    mapnik.render(map_tile, image)

    return image.tostring("png")


@app.errorhandler(ServiceError)
def handle_invalid_usage(error):
    """
    Convert ServiceErrors to HTTP errors.
    """
    return make_response(error.message, error.status_code)


@app.route("/")
def index():
    """
    Redirect to /version from /.
    """
    return redirect(url_for('version'))


@app.route("/version")
def version():
    """
    Return the version of the service, currently hardcoded.
    """
    return jsonify(health='alive', version='0.0.1')


@app.route("/style", methods=['POST'])
def style():
    """
    Convert Carto CSS passed in via the `$style` query param into Mapnik XML.
    """
    body = request.get_json(silent=True)
    if not body:
        raise BadRequest("Malformed JSON.")

    if 'style' in body:
        return render_css(body['style'])
    else:
        raise JsonKeyError('style')


@app.route("/render", methods=['POST'])
def render():
    """
    Actually render the png.

    Expects a JSON blob with 'style', 'zoom', and 'bpbf' values.
    """
    body = request.get_json(silent=True)
    keys = ['bpbf', 'zoom', 'style']

    if not body:
        raise BadRequest("Malformed JSON.")

    if set(keys) <= set(body):
        zoom = None
        try:
            zoom = int(body['zoom'])
        except ValueError:
            raise BadRequest('JSON value "zoom" must be an integer.')

        pbf = base64.b64decode(body['bpbf'])
        tile = mapbox_vector_tile.decode(pbf)
        xml = render_css(body['style'])
        return render_png(tile, zoom, xml)

    else:
        raise JsonKeyError(keys)


def old_main():
    """
    Main function.
    """
    ctx = mapnik.Context()

    feat11 = mapnik.Feature(ctx, 11)
    feat11.add_geometries_from_wkt("POINT(10 10)")

    feat22 = mapnik.Feature(ctx, 22)  # What do the args mean?
    feat22.add_geometries_from_wkt("POINT(20 20)")

    feat33 = mapnik.Feature(ctx, 33)  # What do the args mean?
    feat22.add_geometries_from_wkt("POINT(30 30)")

    feat44 = mapnik.Feature(ctx, 44)  # What do the args mean?
    feat44.add_geometries_from_wkt("POINT(40 40)")

    # Still need to figure out what the ID is used for...
    feat_poly = mapnik.Feature(ctx, 99)
    feat_poly.add_geometries_from_wkt("POLYGON((64 64,96 128,128 64,64 64))")

    source = mapnik.MemoryDatasource()
    source.add_feature(feat11)
    source.add_feature(feat22)
    source.add_feature(feat33)
    source.add_feature(feat44)
    source.add_feature(feat_poly)

    tile = mapnik.Map(256, 256)
    xml = render_css("#main{marker-line-color:#00C;marker-width:1}")
    mapnik.load_map_from_string(tile, xml)
    tile.zoom_to_box(mapnik.Box2d(0, 0, 255, 255))

    layer = mapnik.Layer('main')
    layer.datasource = source
    layer.styles.append('main')

    tile.layers.append(layer)

    mapnik.render_to_file(tile, 'test.png', 'png')

if __name__ == "__main__":
    app.run(debug=True, port=4096)
