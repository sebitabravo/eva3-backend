# ===================================
# DOCKERFILE UNIVERSAL - Frontend
# Funciona para desarrollo Y producción
# Build: 2025-10-11 21:10 - Modo demo con login automático
# ===================================

ARG NODE_ENV=production

# ===================================
# Stage: Builder (para producción)
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias primero (mejor caché)
COPY package*.json ./

# Actualizar npm a la última versión
RUN npm install -g npm@latest

# Instalar dependencias
RUN npm install

# Copiar todo el código
COPY . .

# ARG para recibir variables de entorno en build time
ARG VITE_API_URL
ARG VITE_DEMO_MODE

# Exportar como variables de entorno para que Vite las use
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE

# Invalidar caché con timestamp (forzar rebuild)
ARG CACHEBUST=1
RUN echo "Build timestamp: $CACHEBUST"

# Build para producción
RUN npm run build

# ===================================
# Stage: Production con Nginx
# ===================================
FROM nginx:alpine AS production

# Copiar archivos build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivo de configuración de runtime (placeholder)
COPY env-config.js /usr/share/nginx/html/env-config.js

# Copiar script de entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]

# ===================================
# Stage: Development
# ===================================
FROM node:20-alpine AS development

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto de desarrollo
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ===================================
# Stage Final: Selección automática
# ===================================
FROM ${NODE_ENV} AS final
