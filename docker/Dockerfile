FROM socrata/runit-nodejs-focal:18x as base

ARG ARTIFACTORY_USER
ARG ARTIFACTORY_PASSWORD

ADD index.js package.json /app/
COPY runit /etc/service/carto-style-renderer
WORKDIR /app

FROM base as test

RUN mkdir -p /app/test
ADD test.js /app/test/

RUN npm config set registry https://repo.socrata.com/artifactory/api/npm/npm-virtual \
&&  curl -s -u"${ARTIFACTORY_USER}":"${ARTIFACTORY_PASSWORD}" "https://repo.socrata.com/artifactory/api/npm/auth" >> ~/.npmrc \
&&  npm config fix \
&&  npm install \
&&  rm -f ~/.npmrc \
&&  npm install -g mocha \
&&  mocha

FROM base

RUN npm config set registry https://repo.socrata.com/artifactory/api/npm/npm-virtual \
&&  curl -s -u"${ARTIFACTORY_USER}":"${ARTIFACTORY_PASSWORD}" "https://repo.socrata.com/artifactory/api/npm/auth" >> ~/.npmrc \
&&  npm config fix \
&&  npm install --omit=dev \
&&  rm -f ~/.npmrc

RUN date -u +"%Y-%m-%dT%H:%M:%SZ" > build-time.txt
