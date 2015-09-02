FROM socrata/base

EXPOSE 4096

RUN DEBIAN_FRONTEND=noninteractive apt-get -y update && \
    DEBIAN_FRONTEND=noninteractive apt-get -y install \
                                   git \
                                   wget \
                                   nodejs \
                                   npm

# Node hacks.
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN git config --global url."https://".insteadOf git://
ADD package.json /app/
WORKDIR /app
RUN npm install

COPY ship.d /etc/ship.d/
ADD index.js /app/
