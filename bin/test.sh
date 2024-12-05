#!/bin/bash

set -ev

DOCKER_BUILDKIT=1 docker build \
    --target test \
    --secret id=npmrc,src="$HOME/.npmrc" \
    -t carto-style-renderer-test \
    . \
    --progress=plain
