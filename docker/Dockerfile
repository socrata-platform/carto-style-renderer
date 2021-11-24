FROM socrata/runit-nodejs-bionic:14x

ARG ARTIFACTORY_USER
ARG ARTIFACTORY_PASSWORD

ADD package.json /app/
COPY runit /etc/service/carto-style-renderer
WORKDIR /app

RUN npm config set registry https://repo.socrata.com/artifactory/api/npm/npm-virtual \
&&  curl -s -u"${ARTIFACTORY_USER}":"${ARTIFACTORY_PASSWORD}" "https://repo.socrata.com/artifactory/api/npm/auth" >> ~/.npmrc \
&&  npm install --production \
&&  rm -f ~/.npmrc

ADD index.js /app/
RUN date -u +"%Y-%m-%dT%H:%M:%SZ" > build-time.txt
