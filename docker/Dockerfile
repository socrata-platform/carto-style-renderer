FROM socrata/runit-nodejs-bionic-10x

ADD package.json /app/
COPY runit /etc/service/carto-style-renderer
WORKDIR /app

RUN npm install --production

ADD index.js /app/
RUN date -u +"%Y-%m-%dT%H:%M:%SZ" > build-time.txt
