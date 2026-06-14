FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY services/tracking-service/package.json ./services/tracking-service/

WORKDIR /app/services/tracking-service
RUN npm install express pg
RUN npm install -g typescript

COPY tsconfig.json ./
COPY services/tracking-service/tsconfig.json ./services/tracking-service/
COPY services/tracking-service/src ./services/tracking-service/src

WORKDIR /app/services/tracking-service
RUN tsc

EXPOSE 3002

CMD ["node", "dist/services/tracking-service/src/index.js"]
