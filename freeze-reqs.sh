#!/bin/bash

DEV_REQ_FILE='dev-reqs.txt'
REQ_FILE='requirements.txt'

BASEDIR="$( dirname "$0" )"
cd "$BASEDIR"

REQS=$(sed 's/#.*//' "${DEV_REQ_FILE}" | grep -v '^$')
REQS=${REQS}
REQS=$(echo "(${REQS})" | sed 's/ /)|(/g')

pip freeze -r "${DEV_REQ_FILE}" | egrep "${REQS}" > "${REQ_FILE}"
