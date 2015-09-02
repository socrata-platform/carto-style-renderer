# Carto Style Renderer #
This service renders Carto CSS to Mapnik XML.

```
curl localhost:4097/style -H 'Content-type: text/plain' -d @examples/main.mss
```

## Start the Service ##
node index.js

## Testing ##
This depends on mocha: `npm install -g mocha`

mocha
