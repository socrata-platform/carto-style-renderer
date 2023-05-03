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
npx mocha
```

## Example Request ##

This is appending the contents of examples/main.mss.enc as the query parameter. The contents of the query parameter is always a URI-encoded stylesheet.

```
cd carto-style-renderer
curl "localhost:4097/style?style=$(cat examples/main.mss.enc)"
```

## Building ##
See [docker/README.md](./docker/README.md).

## Deploying ##
Remember to run `node bin/release.js` to update the version after merging.
