FROM socrata/python

ENV ftp_proxy http://proxy.aws-us-west-2-infrastructure.socrata.net:3128
ENV http_proxy http://proxy.aws-us-west-2-infrastructure.socrata.net:3128
ENV https_proxy http://proxy.aws-us-west-2-infrastructure.socrata.net:3128

RUN apt-get update

ADD requirements.txt
RUN pip install -r requirements.txt

COPY ship.d /etc/ship.d/
WORKDIR /app
ADD carto_renderer /app
EXPOSE 4096
