#!/bin/bash
# Legacy image build for instances seeded BEFORE the switch to deterministic
# static-record IDs (see scripts/generate/staticRecordId.ts).
#
# Such an instance's reference tables hold random UUIDs, and its transactional
# data references them. Rather than mutate the production DB, this builds an image
# whose baked-in configs/staticRecords/* are generated from a COPY of that
# instance's own database, so the image's IDs match the live DB by construction.
#
# DATABASE_URL must point at a *restore of the live dump* (a local scratch DB),
# NOT the production database directly. This script only reads from it.
#
# See Dockerfile.legacy and docs/content/docs/Deployment.mdx.
set -euo pipefail

# handle env variables
set -a
source .env
set +a

: "${DATABASE_URL:?DATABASE_URL must point at a restore of the live database}"
: "${DOCKER_REGISTRY:?DOCKER_REGISTRY must be set in .env}"
: "${DOCKER_IMAGE_NAME:?DOCKER_IMAGE_NAME must be set in .env}"

echo "⚠️  Legacy build. Generating static records from: $DATABASE_URL"
echo "    This must be a RESTORE of the live DB, not production itself."

echo "Generating static records from the database..."
npm run generate-static-records

# Snapshot the live-DB-generated configs (these are what we want to ship).
GEN_DIR="$(mktemp -d)"
cp configs/staticRecords/*.ts "$GEN_DIR"/ 2>/dev/null || true

# Produce the deterministic set (full set the current code expects) for comparison.
# This overwrites configs/staticRecords/*, so we restore the generated set afterward.
echo "Computing expected record set for the missing-record check..."
npm run scaffold-static-records
DET_DIR="$(mktemp -d)"
cp configs/staticRecords/*.ts "$DET_DIR"/ 2>/dev/null || true

# Restore the live-DB-generated configs so the image is built from them.
rm -f configs/staticRecords/*.ts
cp "$GEN_DIR"/*.ts configs/staticRecords/ 2>/dev/null || true

# Missing-record check: every key the current code expects (deterministic set)
# must be present in what the live DB produced. Gaps mean the new release
# references a static record the live DB does not have yet — insert those rows
# into the live DB, re-dump/re-restore, and re-run before shipping.
echo "Checking for records the live DB is missing..."
missing=0
for f in "$DET_DIR"/*.ts; do
  name="$(basename "$f")"
  gen="$GEN_DIR/$name"
  if [ ! -f "$gen" ]; then
    echo "  ✗ $name: no rows in the live DB for this table"
    missing=1
    continue
  fi
  only="$(comm -23 \
    <(grep -oE '"[^"]+":' "$f" | sort -u) \
    <(grep -oE '"[^"]+":' "$gen" | sort -u))"
  if [ -n "$only" ]; then
    echo "  ✗ $name is missing keys the code expects:"
    echo "$only" | sed 's/^/      /'
    missing=1
  fi
done
rm -rf "$GEN_DIR" "$DET_DIR"

if [ "$missing" -ne 0 ]; then
  echo "✗ Live DB is missing required static records (see above). Aborting."
  echo "  Insert the missing rows into the live DB, re-restore, and re-run."
  exit 1
fi
echo "✓ All expected static records present in the live DB."

echo "Building legacy image..."
DOCKER_BUILDKIT=1 docker build -f Dockerfile.legacy -t "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest" .

echo "Pushing to registry..."
docker push "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest"
echo "✓ Legacy update complete!"
