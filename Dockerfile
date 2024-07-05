# syntax=docker/dockerfile:1

FROM socrata/runit-nodejs-focal:18x as base

WORKDIR /app
COPY index.js package.json /app/

FROM base as test

RUN mkdir -p /app/test
COPY /test/test.js /app/test/

RUN --mount=type=secret,required=true,id=npmrc,target="${HOME}/.npmrc" \
    npm install \
&&  npx mocha

RUN echo "success" > /app/test.txt

FROM base

COPY --from=test app/test.txt app/

RUN --mount=type=secret,required=true,id=npmrc,target="${HOME}/.npmrc" \
    NODE_ENV=production npm install

COPY docker/runit /etc/service/carto-style-renderer

RUN date -u +"%Y-%m-%dT%H:%M:%SZ" > build-time.txt
