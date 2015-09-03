# Carto Style Renderer Docker Config #

## Building ##
To build the image, run:
```
cp ../index.js ../package.json
docker build -t carto-style-renderer .
```
 
Or, if you want to replace old versions:
```
cp ../index.js ../package.json
docker build --rm -t carto-style-renderer .
```

## Running ##
```
docker run -p 4097:4097 -d carto-style-renderer
```
