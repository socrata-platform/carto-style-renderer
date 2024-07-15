# Carto Style Renderer Docker Config #

## Building ##
To build the image, run:

```
  DOCKER_BUILDKIT=1 docker build \
  --secret id=npmrc,src=$HOME/.npmrc \
  --tag carto-style-renderer \
  .
```

If your .npmrc file is not located in the $HOME directory, then adjust that path.
Add `--target=test` to only run the test.

## Running ##
```
docker run -p 4097:4097 -d carto-style-renderer
```
