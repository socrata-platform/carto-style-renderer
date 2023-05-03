# Carto Style Renderer Docker Config #

## Building ##
To build the image, run:

```
cp ../index.js ../package.json ../test.js .
DOCKER_BUILDKIT=1 docker build \
  --build-arg ARTIFACTORY_USER="${ARTIFACTORY_USER}" \
  --build-arg ARTIFACTORY_PASSWORD="${ARTIFACTORY_PASSWORD}" \
  --tag carto-style-renderer \
  .
```

Add `--target="test"` to run the test.

## Running ##
```
docker run -p 4097:4097 -d carto-style-renderer
```
