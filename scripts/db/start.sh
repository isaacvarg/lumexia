#!/usr/bin/env bash
# db:start — run the init pipeline against the existing database.
# Non-destructive: does NOT drop/create the database, no DEMO_SEED required.
set -euo pipefail
cd "$(dirname "$0")/../.."
# shellcheck source=scripts/db/lib.sh
source scripts/db/lib.sh

run_init_pipeline
