FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src
COPY assets ./assets

ENV DATA_DIR=/app/data

CMD ["node", "src/index.js"]
