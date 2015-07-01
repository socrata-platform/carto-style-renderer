#!/usr/bin/env python
"""
Pipeline together a few different mapnik examples in Python.
"""

import mapnik                   # pylint: disable=import-error
from subprocess import Popen, PIPE

RENDERER = None
def style(carto_css):
    """
    Transform Carto CSS into Mapnik XML.

    Carto CSS must be formatted on a single line, ending in a line break.
    """
    global RENDERER

    if not RENDERER or not RENDERER.poll():
        RENDERER = Popen(['node', 'style.js'],
                         stdin=PIPE,
                         stdout=PIPE,
                         stderr=PIPE)
    RENDERER.stdin.write(carto_css)
    return RENDERER.stdout.readline()


def main():
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
    xml = style("#main{marker-line-color:#00C;marker-width:1}")
    mapnik.load_map_from_string(tile, xml)
    tile.zoom_to_box(mapnik.Box2d(0, 0, 255, 255))

    layer = mapnik.Layer('main')
    layer.datasource = source
    layer.styles.append('main')

    tile.layers.append(layer)

    mapnik.render_to_file(tile, 'test.png', 'png')

main()
