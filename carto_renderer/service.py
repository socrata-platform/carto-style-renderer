#!/usr/bin/env python
"""
Service to render pngs from vector tiles using Carto CSS.
"""
import base64
import mapnik                   # pylint: disable=import-error

from flask import Flask, jsonify, make_response, redirect, request, url_for
from subprocess import Popen, PIPE

# I think pylint doesn't like how I set up my path...
# pylint: disable=no-name-in-module, import-error
from errors import BadRequest, JsonKeyError, ServiceError
from vector_tile_pb2 import Tile
# pylint: enable=no-name-in-module

# All examples seem to use `app` not `APP`.
app = Flask(__name__)           # pylint: disable=invalid-name


# Some of the tile parsing logic is based on code from here:
# https://github.com/mapbox/vector-tile-py

def decode_coord(coord):
    """
    Decode a single coordinate.
    """
    return ((coord >> 1) ^ (-(coord & 1))) / 16


def create_wkt(geometry, geom_type):
    """
    Create Well Known Text for `geometry` based on `geom_type`.
    """

    if geom_type == 1:      # Point.
        x_px, y_px = decode_coord(geometry[1]), decode_coord(geometry[2])
        return "POINT({} {})".format(x_px, y_px)
    elif geom_type == 2:    # Line String.
        raise BadRequest("TODO: Not implemented!")
    elif geom_type == 3:    # Polygon.
        raise BadRequest("TODO: Not implemented!")
    else:
        raise BadRequest("Invalid geometry type!")


def parse_properties(feature):
    """
    Parse properties from `feature`.
    """
    return {}                   # TODO


def parse_tile(bpbf):
    """
    Parse a binary encoded vector tile (protobuffer) into an object.
    """
    pbf = base64.b64decode(bpbf)
    tile = Tile()
    tile.ParseFromString(pbf)
    layers = []
    for proto_layer in tile.layers:
        features = []
        layer = {'name': proto_layer.name}
        layer['features'] = features
        layers.append(layer)

        for feature in proto_layer.features:
            geom = create_wkt(feature.geometry, feature.type)
            props = parse_properties(feature)
            features.append({'geometry': geom, 'properties': props})

    return layers


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


def render_png(tile, zoom, xml):
    """
    Render the tile for the given zoom
    """
    ctx = mapnik.Context()
    map_tile = mapnik.Map(256, 256)
    mapnik.load_map_from_string(map_tile, xml)
    map_tile.zoom_to_box(mapnik.Box2d(0, 0, 255, 255))

    for layer in tile:
        source = mapnik.MemoryDatasource()
        map_layer = mapnik.Layer("main")
        map_layer.datasource = source

        for feature in layer['features']:
            feat = mapnik.Feature(ctx, 0)
            feat.add_geometries_from_wkt(feature['geometry'])
            source.add_feature(feat)

        map_layer.styles.append("main")
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

        tile = parse_tile(body['bpbf'])
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
