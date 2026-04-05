#!/bin/bash

set -e

function prepare_database {
  npx prisma migrate deploy
  npx prisma generate
  npx prisma db seed
}

prepare_database

if [ "$ENROLLMENT_KEY" != "" && "$CONTROLLER_URL" != "" ];
then
  node ./lib/bin.js -k sounderKey -v "$ENROLLMENT_KEY"
  node ./lib/bin.js -k controllerAddress -v "$CONTROLLER_URL"
  node ./lib/bin.js --enroll-with-config
fi

node ./lib/bin.js -u

node ./lib/bin.js -s