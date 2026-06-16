#!/usr/bin/env bash
# db:demo:start — same as db:dev:start, plus demo data and a static-records
# regeneration. Destructive: requires DEMO_SEED=true. Pass -y/--yes to skip prompt.
set -euo pipefail
cd "$(dirname "$0")/../.."
# shellcheck source=scripts/db/lib.sh
source scripts/db/lib.sh

for arg in "$@"; do
  case "$arg" in
    -y|--yes) export ASSUME_YES=1 ;;
  esac
done

require_demo_seed
recreate_database
run_init_pipeline
npm run seed:demo
npm run generate-static-records
