# Etapa 1 — Build do React
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2 — Servindo com Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# 👇 Copia o Nginx.conf customizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
