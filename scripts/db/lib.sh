#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"

env_get() {
  grep -E "^[[:space:]]*$1[[:space:]]*[=:]" "$ENV_FILE" 2>/dev/null | head -1 |
    sed -E "s/^[[:space:]]*$1[[:space:]]*[=:][[:space:]]*//; s/^[\"']//; s/[\"']$//" || true
}

require_demo_seed() {
  if [ "$(env_get DEMO_SEED)" != "true" ]; then
    echo "" >&2
    echo "😭 Hold up!: DEMO_SEED must be set to \"true\" in $ENV_FILE." >&2
    echo "   This guard prevents a real instance from being dropped/recreated." >&2
    echo "" >&2
    exit 1
  fi
}

recreate_database() {
  local dbname host
  dbname="$(env_get POSTGRES_DB)"
  if [ -z "$dbname" ]; then
    echo "💔 POSTGRES_DB not found in $ENV_FILE" >&2
    exit 1
  fi

  host="$(env_get POSTGRES_HOST)"
  export PGHOST="${host:-postgres}"
  export PGPORT="$(env_get POSTGRES_PORT)"
  export PGPORT="${PGPORT:-5432}"
  export PGUSER="$(env_get POSTGRES_USER)"
  export PGPASSWORD="$(env_get POSTGRES_PASSWORD)"

  if [ "${ASSUME_YES:-}" != "1" ]; then
    echo "🔥 WARNING: About to DROP and recreate database \"$dbname\" on $PGHOST:$PGPORT"
    read -r -p "   Type 'y' to continue: " ans
    if [ "$ans" != "y" ]; then
      echo "Aborted."
      exit 1
    fi
  fi

  echo "🔥  Dropping \"$dbname\"..."
  psql postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$dbname\" WITH (FORCE);"
  echo "✨ Creating \"$dbname\"..."
  psql postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$dbname\";"
  echo "✅ Recreated database \"$dbname\""
}

run_init_pipeline() {
  npx prisma migrate deploy
  npx prisma generate
  npm run init
  npm run generate-static-records
}
