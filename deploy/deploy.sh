#!/usr/bin/env bash
set -euo pipefail

# load .env into environment
if [ -f .env ]; then
  set -o allexport
  source .env
  set +o allexport
else
  echo ".env not found!"
  exit 1
fi

# install & build
npm install
npm run build

# deploy
cdk deploy \
  --require-approval never
