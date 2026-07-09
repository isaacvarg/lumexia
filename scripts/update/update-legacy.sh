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

# No separate "missing record" check here: the configs are `as const` and the app
# dereferences them by static dot-notation, so `npm run build` (below, inside the
# image) fails at compile time on any static-record key the code needs but the live
# DB lacks. That type-check is the authoritative gate. Records that exist only in the
# demo seed data — and which a real instance legitimately doesn't have — are NOT a
# problem and must not block the build.
echo "Building legacy image (npm run build inside is the type-checked gate)..."
DOCKER_BUILDKIT=1 docker build -f Dockerfile.legacy -t "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest" .

echo "Pushing to registry..."
docker push "$DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest"
echo "✓ Legacy update complete!"
