# Carto Test Service #
This is a service that's a proof of concept for getting a service that
renders vector tiles into images using CartoCSS.

You can exercise it with the following curl command.
```
curl -o test.png localhost:2049/render -H 'Content-type: application/json' -d @examples/main.json
```
This will save an image to `test.png`.
