FROM socrata/python

ENV ftp_proxy http://proxy.aws-us-west-2-infrastructure.socrata.net:3128
ENV http_proxy http://proxy.aws-us-west-2-infrastructure.socrata.net:3128
ENV https_proxy http://proxy.aws-us-west-2-infrastructure.socrata.net:3128

RUN apt-get update
RUN apt-get install python-mapnik2

ADD requirements.txt /app/
RUN pip install -r /app/requirements.txt

COPY ship.d /etc/ship.d/
WORKDIR /app
ADD carto_renderer /app
EXPOSE 4096
