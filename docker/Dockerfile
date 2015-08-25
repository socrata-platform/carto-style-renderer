FROM socrata/python

EXPOSE 4096

RUN DEBIAN_FRONTEND=noninteractive apt-get -y update && \
    DEBIAN_FRONTEND=noninteractive apt-get -y install \
                                   git \
                                   wget \
                                   python-mapnik2 \
                                   nodejs \
                                   npm

RUN mkdir -p /app/carto_renderer

# Node hacks.
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN git config --global url."https://".insteadOf git://
ADD package.json /app/
WORKDIR /app
RUN npm install

ADD frozen.txt /app/
RUN pip install -r /app/frozen.txt

ADD logging.ini /etc/
COPY ship.d /etc/ship.d/
ADD carto_renderer /app/carto_renderer
ADD style.js /app/
