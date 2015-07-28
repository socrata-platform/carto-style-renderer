FROM socrata/python

ENV ftp_proxy http://proxy.aws-us-west-2-infrastructure.socrata.net:3128
ENV http_proxy http://proxy.aws-us-west-2-infrastructure.socrata.net:3128
ENV https_proxy http://proxy.aws-us-west-2-infrastructure.socrata.net:3128

RUN DEBIAN_FRONTEND=noninteractive apt-get -y update && \
    DEBIAN_FRONTEND=noninteractive apt-get -y install python-mapnik2 node

ADD requirements.txt /app/
RUN pip install -r /app/requirements.txt

COPY ship.d /etc/ship.d/

WORKDIR /app
RUN mkdir -p /app/carto_renderer
ADD carto_renderer /app/carto_renderer

EXPOSE 4096
