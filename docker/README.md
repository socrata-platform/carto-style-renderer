# Carto Style Renderer Docker Config #
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
