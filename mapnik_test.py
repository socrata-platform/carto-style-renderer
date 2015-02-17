#!/usr/bin/env python
"""
Pipeline together a few different mapnik examples in Python.
"""

import mapnik                   # pylint: disable=import-error

XML = """<?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE Map[]>
    <Map>
      <Style name="main" filter-mode="first">
        <Rule>
          <Filter>([count] &gt;= 2)</Filter>
          <MarkersSymbolizer fill="#0000ff" stroke="#000099"
             stroke-opacity="0.5" stroke-width="1" />
        </Rule>
        <Rule>
          <MarkersSymbolizer fill="#ccccff" stroke="#000099"
            stroke-opacity="0.5" stroke-width="1" />
        </Rule>
      </Style>
      <Layer name="main" >
          <StyleName>main</StyleName>
      </Layer>
    </Map>
    """

def main():
    """
    Main function.
    """
    ctx = mapnik.Context()

    feat00 = mapnik.Feature(ctx, 00)
    feat00.add_geometries_from_wkt("POINT(0 0)")

    feat22 = mapnik.Feature(ctx, 22) # What do the args mean?
    feat22.add_geometries_from_wkt("POINT(20 20)")

    feat44 = mapnik.Feature(ctx, 44) # What do the args mean?
    feat44.add_geometries_from_wkt("POINT(40 40)")

    source = mapnik.MemoryDatasource()
    source.add_feature(feat00)
    source.add_feature(feat22)
    source.add_feature(feat44)

    tile = mapnik.Map(256, 256)
    mapnik.load_map_from_string(tile, XML)
    tile.zoom_to_box(mapnik.Box2d(0, 0, 255, 255))

    layer = mapnik.Layer('main')
    layer.datasource = source
    layer.styles.append('main')

    print(dir(tile.layers[0].name))
    tile.layers.append(layer)

    mapnik.render_to_file(tile, 'python-test.png', 'png')

main()
