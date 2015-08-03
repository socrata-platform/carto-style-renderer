#!/bin/bash

set -ev

if [ ! -d "venv" ]; then
    virtualenv venv
fi
. venv/bin/activate

if [ ! -d venv/lib/python2.7/site-packages/mapnik ]; then
    ln -s /usr/lib/python2.7/dist-packages/mapnik venv/lib/python2.7/site-packages/
fi

if [ ! -d venv/lib/python2.7/site-packages/mapnik2 ]; then
    ln -s /usr/lib/python2.7/dist-packages/mapnik2 venv/lib/python2.7/site-packages/
fi

pip install --upgrade pytest
pip install --upgrade --requirement "requirements.txt"
pip install --upgrade --requirement "test-requirements.txt"

npm install

PYTHONPATH=. py.test carto_renderer
