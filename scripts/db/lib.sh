#!/usr/bin/env bash

# helpers for the db:* deploy scripts.
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"

# read one value from $ENV_FILE. Tolerates both `KEY=value` and `KEY: value`
# forms and strips surrounding single/double quotes. avoids `source .env`,
# which chokes on colon-form lines and values containing spaces.
env_get() {
  grep -E "^[[:space:]]*$1[[:space:]]*[=:]" "$ENV_FILE" 2>/dev/null | head -1 |
    sed -E "s/^[[:space:]]*$1[[:space:]]*[=:][[:space:]]*//; s/^[\"']//; s/[\"']$//"
}

# abort unless DEMO_SEED=true
# instance can never be wiped/recreated by accident... theoretically
require_demo_seed() {
  if [ "$(env_get DEMO_SEED)" != "true" ]; then
    echo "" >&2
    echo "😭 Hold up!: DEMO_SEED must be set to \"true\" in $ENV_FILE." >&2
    echo "   This guard prevents a real instance from being dropped/recreated." >&2
    echo "" >&2
    exit 1
  fi
}

# drop and recreate the database named in DATABASE_URL. Connects to the
# `postgres` maintenance DB so we aren't attached to the DB being dropped.
recreate_database() {
  local url no_query dbname admin_url host
  url="$(env_get DATABASE_URL)"
  if [ -z "$url" ]; then
    echo "💔 DATABASE_URL not found in $ENV_FILE" >&2
    exit 1
  fi

  no_query="${url%%\?*}"   # strip ?schema=... etc
  dbname="${no_query##*/}" # last path segment
  admin_url="${no_query%/*}/postgres"
  host="$(printf '%s' "$no_query" | sed -E 's#.*@([^/]+)/.*#\1#')"

  if [ "${ASSUME_YES:-}" != "1" ]; then
    echo "🔥 WARNING: About to DROP and recreate database \"$dbname\" on $host"
    read -r -p "   Type 'y' to continue: " ans
    if [ "$ans" != "y" ]; then
      echo "Aborted."
      exit 1
    fi
  fi

  echo "🔥  Dropping \"$dbname\"..."
  psql "$admin_url" -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$dbname\" WITH (FORCE);"
  echo "✨ Creating \"$dbname\"..."
  psql "$admin_url" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$dbname\";"
  echo "✅ Recreated database \"$dbname\""
}

# apply migrations, regenerate the client, and run the standard init seeds.
run_init_pipeline() {
  npx prisma migrate deploy
  npx prisma generate
  npm run init
  npm run generate-static-records
}
