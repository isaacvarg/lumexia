FROM node:20

WORKDIR /app

# Install Ghostscript and GraphicsMagick
RUN apt-get update && apt-get install -y \
    ghostscript \
    graphicsmagick \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

COPY . .

RUN npm install

# Static records are excluded from the image (see .dockerignore). Scaffold
# placeholder versions so the build can compile and the container can boot.
# Real IDs are produced post-deploy with `npm run refresh-static-records`.
RUN npm run scaffold-static-records

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]



