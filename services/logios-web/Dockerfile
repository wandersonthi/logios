# Etapa de build
FROM node:20-alpine as build

WORKDIR /app

# Copia package.json e dependências (se houver)
COPY package.json ./
# Como não temos um package-lock.json ainda, instalamos diretamente
RUN npm install

# Copia o resto dos arquivos
COPY . .

# Compila o projeto (Vite build)
RUN npm run build

# Etapa de produção usando Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
