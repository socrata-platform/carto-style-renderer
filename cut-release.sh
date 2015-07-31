#!/bin/bash

REQ_FILE='requirements.txt'
FROZEN_FILE='frozen.txt'

BASEDIR="$( dirname "$0" )"
cd "$BASEDIR"

REQS=$(sed 's/#.*//' "${REQ_FILE}" | grep -v '^$' | tr "\\n" ' ' | sed -r 's/ +$//')
REQS="(${REQS// /)|(})"

pip freeze -r "${REQ_FILE}" | egrep "${REQS}" > "${FROZEN_FILE}"
