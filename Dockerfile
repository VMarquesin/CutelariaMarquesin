FROM node:20-alpine AS construtor-front
WORKDIR /app/frontend
# Instala as dependências
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
FROM node:20-alpine
WORKDIR /app/api
# Instala as dependências
COPY API/package*.json ./
RUN npm install
COPY API/ ./
COPY --from=construtor-front /app/frontend/dist ./dist
# Expõe a porta e roda o servidor
EXPOSE 3000
CMD ["npm", "start"]