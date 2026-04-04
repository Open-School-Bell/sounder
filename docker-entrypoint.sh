set -e

function prepare_database {
  npx prisma migrate deploy
  npx prisma generate
  npx prisma db seed
}

prepare_database

node ./lib/bin.js -s