# Étape 1 : construction des fichiers statiques avec Node
FROM node:22-alpine AS build
WORKDIR /app

# Les dépendances d'abord : un changement de code n'invalide pas ce cache
COPY app/package*.json ./
RUN npm ci

COPY app/ .
RUN npm run build

# Étape 2 : image finale, Nginx sert uniquement les artefacts
# Cette variante de Nginx tourne sans root et écoute sur le port 8080
FROM nginxinc/nginx-unprivileged:1.28-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
