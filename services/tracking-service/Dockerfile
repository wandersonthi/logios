FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY services/tracking-service/package.json ./services/tracking-service/

WORKDIR /app/services/tracking-service
RUN npm install express pg
RUN npm install -g typescript

COPY services/tracking-service/tsconfig.json ./
COPY services/tracking-service/src ./src

RUN tsc

EXPOSE 3002

CMD ["node", "dist/index.js"]
