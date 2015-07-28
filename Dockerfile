FROM socrata/python

# ENV ftp_proxy http://proxy.aws-us-west-2-infrastructure.socrata.net:3128
# ENV http_proxy http://proxy.aws-us-west-2-infrastructure.socrata.net:3128
# ENV https_proxy http://proxy.aws-us-west-2-infrastructure.socrata.net:3128

RUN DEBIAN_FRONTEND=noninteractive apt-get -y update && \
    DEBIAN_FRONTEND=noninteractive apt-get -y install \
                                   git \
                                   wget \
                                   python-mapnik2 \
                                   nodejs \
                                   npm



ADD requirements.txt /app/
RUN pip install -r /app/requirements.txt

# Node hacks.
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN git config --global url."https://".insteadOf git://
ADD package.json /app/
WORKDIR /app
RUN npm install

COPY ship.d /etc/ship.d/

RUN mkdir -p /app/carto_renderer
ADD carto_renderer /app/carto_renderer
ADD style.js /app/

EXPOSE 4096
