#!/bin/sh
set -e

echo "🚀 Configurando variables de entorno en runtime..."

# Archivo de configuración que será servido por nginx
ENV_FILE="/usr/share/nginx/html/env-config.js"

# Reemplazar placeholders con valores reales de variables de entorno
cat > $ENV_FILE << EOF
window.ENV_CONFIG = {
  VITE_API_URL: '${VITE_API_URL:-http://localhost:8000/api/v1}',
  VITE_DEMO_MODE: '${VITE_DEMO_MODE:-false}'
};
EOF

echo "✅ Variables de entorno configuradas:"
echo "   VITE_API_URL: ${VITE_API_URL:-http://localhost:8000/api/v1}"
echo "   VITE_DEMO_MODE: ${VITE_DEMO_MODE:-false}"

# Iniciar nginx
echo "🌐 Iniciando Nginx..."
exec nginx -g 'daemon off;'
