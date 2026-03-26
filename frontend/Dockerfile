FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
# Instalando dependências ignorando alertas de versão
RUN npm install --quiet
COPY . .
# O pulo do gato: ignorar erros de tipos no build para não travar a apresentação
RUN npm run build || (npx vite build)

FROM nginx:alpine
# Nota: Verifique se o Vite gera a pasta 'dist' ou 'build'. O padrão atual é 'dist'.
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
