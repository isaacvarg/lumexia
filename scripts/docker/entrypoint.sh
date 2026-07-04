#!/usr/bin/env bash
# container entrypoint

set -euo pipefail

cd "$(dirname "$0")/../.."

source scripts/db/lib.sh

# wait for psql to accept connections
PGHOST="$(env_get POSTGRES_HOST)"
PGHOST="${PGHOST:-postgres}"
PGPORT="$(env_get POSTGRES_PORT)"
PGPORT="${PGPORT:-5432}"
echo "⏳ Waiting for Postgres at ${PGHOST}:${PGPORT}..."
until pg_isready -h "$PGHOST" -p "$PGPORT" >/dev/null 2>&1; do
  sleep 1
done
echo "✅ Postgres is ready."

# apply migrations (idempotent + non-destructive) and refresh the client
npx prisma migrate deploy
npx prisma generate

# seed ONCE if the DB has never been initialized. `npm run init` is descructive, psql now guards it
if npx tsx scripts/db/is-initialized.ts; then
  echo "✅ Database already initialized — skipping seed."
else
  echo "🌱 Database is uninitialized — seeding..."
  npm run init
  if [ "$(env_get DEMO_SEED)" = "true" ]; then
    npm run seed:demo
  fi
fi

# serve
exec npm run start
