#!/bin/bash

set -ev

# Change to the project root.
cd "$(git rev-parse --show-toplevel 2>/dev/null)"

REQ_FILE='requirements.txt'
FROZEN_FILE='frozen.txt'

REQS=$(sed 's/#.*//' "${REQ_FILE}" | grep -v '^$' | tr "\\n" ' ' | sed -r 's/ +$//')
REQS="(${REQS// /)|(})"

pip freeze -r "${REQ_FILE}" | egrep "${REQS}" > "${FROZEN_FILE}"
