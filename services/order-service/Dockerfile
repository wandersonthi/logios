FROM node:20-alpine

WORKDIR /app

# Copia os arquivos de lock e package.json do root e do workspace
COPY package.json ./
COPY services/order-service/package.json ./services/order-service/

# Como não estamos usando um lockfile complexo aqui, vamos apenas instalar as deps do order-service
WORKDIR /app/services/order-service
RUN npm install express pg
RUN npm install -g typescript

# Copia o código fonte
COPY tsconfig.json ./
COPY services/order-service/tsconfig.json ./services/order-service/
COPY services/order-service/src ./services/order-service/src

# Compila
WORKDIR /app/services/order-service
RUN tsc

EXPOSE 3001

CMD ["node", "dist/services/order-service/src/index.js"]
