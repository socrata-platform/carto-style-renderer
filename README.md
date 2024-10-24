# Carto Style Renderer

This service renders Carto CSS to Mapnik XML.

## Installation

```
npm install
```

## Start the Service

```
node index.js
```

## Testing

This depends on mocha: `npm install -g mocha`

Run the tests:
```
npx mocha
```

## Example Request

This is appending the contents of examples/main.mss.enc as the query parameter. The contents of the query parameter is always a URI-encoded stylesheet.

```
cd carto-style-renderer
curl "localhost:4097/style?style=$(cat examples/main.mss.enc)"
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

To tag a release to be built and deployed to RC:

1. On main, run `node bin/release.js`. This will create two commits to bump the version and create a git tag for the release version and then push them to the remote repo.
