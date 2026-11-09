#!/usr/bin/env bash
# handle env variables
set -a
source .env
set +a

echo "Building image..."
docker build -t $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest .

if [ $? -eq 0 ]; then
  echo "Pushing to registry..."
  docker push $DOCKER_REGISTRY/$DOCKER_IMAGE_NAME:latest
  echo "✓ Update complete!"
else
  echo "✗ Build failed!"
  exit 1
fi
