# Carto Style Renderer #
This service renders Carto CSS to Mapnik XML.

## Installation ##
npm install

## Start the Service ##
node index.js

## Testing ##
This depends on mocha: `npm install -g mocha`

Run the tests:
```
mocha
```

## Example Request ##
```
curl localhost:4097/style?style=@examples/main.mss.enc
```

## Building ##
See [docker/README.md](./docker/README.md).
