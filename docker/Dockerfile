FROM socrata/nodejs

ADD package.json /app/
COPY ship.d /etc/ship.d/
WORKDIR /app

RUN npm install --production

ADD index.js /app/
RUN date -u +"%Y-%m-%dT%H:%M:%SZ" > build-time.txt
