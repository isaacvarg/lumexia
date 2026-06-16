#!/usr/bin/env bash
# db:dev:start — DROP/CREATE the database, then run the init pipeline.
# Destructive: requires DEMO_SEED=true. Pass -y/--yes to skip the prompt.
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
