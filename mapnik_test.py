#!/usr/bin/env python
"""
Pipeline together a few different mapnik examples in Python.
"""

import mapnik                   # pylint: disable=import-error

XML_HEAD = """<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE Map[]>
<Map>"""
XML_FOOT = """<Layer name="main">
<StyleName>main</StyleName>
</Layer>
</Map>"""

XML = ''
with open('examples/main.xml') as f:
    XML = XML_HEAD + f.read() + XML_FOOT
    XML = XML.replace('name="style"', 'name="main"')


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
    mapnik.load_map_from_string(tile, XML)
    tile.zoom_to_box(mapnik.Box2d(0, 0, 255, 255))

    layer = mapnik.Layer('main')
    layer.datasource = source
    layer.styles.append('main')

    tile.layers.append(layer)

    mapnik.render_to_file(tile, 'python-test.png', 'png')

main()
