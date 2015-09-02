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
curl localhost:4097/style -H 'Content-type: text/plain' -d @examples/main.mss
```
