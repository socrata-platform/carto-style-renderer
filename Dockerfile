# syntax=docker/dockerfile:1

FROM socrata/runit-nodejs-focal:18x AS base

WORKDIR /app
COPY index.js package.json /app/

FROM base AS test

RUN mkdir -p /app/test
COPY /test/test.js /app/test/

RUN --mount=type=secret,required=true,id=npmrc,target="/root/.npmrc" \
    npm install \
&&  npx mocha

FROM base AS prod

RUN --mount=type=secret,required=true,id=npmrc,target="/root/.npmrc" \
    NODE_ENV=production npm install

COPY docker/runit /etc/service/carto-style-renderer

RUN date -u +"%Y-%m-%dT%H:%M:%SZ" > build-time.txt
