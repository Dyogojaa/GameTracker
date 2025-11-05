# Etapa 1: build
FROM node:20 AS build
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia tudo e cria build
COPY . .
RUN npm run build

# Etapa 2: Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
