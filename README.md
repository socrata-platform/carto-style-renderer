# Carto Test Service #
This is a service that's a proof of concept for getting a service that
renders vector tiles into images using CartoCSS.

You can exercise it with the following curl commands.

Transform CartoCSS to MapnikXML.
```
curl localhost:4096/style -H 'Content-type: application/json' -d @examples/main.json
```

Render an image to `test.png`:
```
curl -o test.png localhost:4096/render -H 'Content-type: application/json' -d @examples/main.json
```

## Testing ##
The tests are run using py.test

You can install it by running:
```
pip install pytest
```

Run tests from the root directory:
```
PYTHONPATH=. py.test
```
