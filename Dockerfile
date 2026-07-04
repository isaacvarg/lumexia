FROM node:24

WORKDIR /app

# Install Ghostscript and GraphicsMagick
RUN apt-get update && apt-get install -y \
    ghostscript \
    graphicsmagick \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

COPY . .

RUN npm install

# Static records are excluded from the image (see .dockerignore). Generate them
# here from the seed data with deterministic IDs (no database required). These
# IDs match what the seeder inserts, so this pre-built image is correct against
# any seeded DB — no post-deploy rebuild needed.
RUN npm run scaffold-static-records

RUN npm run build

# Ensure the boot entrypoint is executable regardless of the host's file mode.
RUN chmod +x scripts/docker/entrypoint.sh

EXPOSE 3000

# Boot: apply migrations, seed an empty DB if needed, then start. The image is
# already correct (deterministic IDs), so the container never builds at runtime.
# See scripts/docker/entrypoint.sh.
ENTRYPOINT ["scripts/docker/entrypoint.sh"]



