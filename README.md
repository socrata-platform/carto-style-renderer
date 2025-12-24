# [ARCHIVED] Carto Style Renderer

*NOTE* As of December 2025, this service is deprecated.

This service renders Carto CSS to Mapnik XML.

## Installation

```
npm install
```

## Start the Service

```
node index.js
```

Alternatively, there is a start script in `/bin`

## Automated Testing

Run the tests:

```
npx mocha
```

## Manually Testing

If you are looking to manually test this repo, you can do this by starting the carto-style-renderer locally via `node index.js` and in another terminal run the example query below:

This is appending the contents of examples/main.mss.enc as the query parameter. The contents of the query parameter is always a URI-encoded stylesheet.

```
cd carto-style-renderer
curl "localhost:4097/style?style=$(cat examples/main.mss.enc)"
```

If it is successful, you should get something like this back:

```
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE Map[]>
<Map>
  <Style filter-mode="first" name="main">
    <Rule>
      <MarkersSymbolizer fill="#000066" stroke="#000099" stroke-width="1" width="3" />
      <PolygonSymbolizer fill="#990000" />
    </Rule>
  </Style>
  <Layer name="main">
    <StyleName><![CDATA[main]]></StyleName>
  </Layer>
</Map>
```

## Building

To build the image, run:

```
  DOCKER_BUILDKIT=1 docker build \
  --secret id=npmrc,src=$HOME/.npmrc \
  --tag carto-style-renderer \
  .
```

If your .npmrc file is not located in the $HOME directory, then adjust that path.
Add `--target=test` to only run the test.

## Running

```
docker run -p 4097:4097 -d carto-style-renderer
```

## Releases

Releases are managed by the shared release process.
