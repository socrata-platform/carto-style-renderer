FROM socrata/nodejs

ADD package.json /app/
WORKDIR /app
RUN npm install --production

COPY ship.d /etc/ship.d/
ADD index.js /app/
