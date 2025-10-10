#!/bin/bash
# Script para resetear contraseña de PostgreSQL en producción
# Usar solo si tienes datos que no quieres perder

set -e

echo "🔧 Arreglando contraseña de PostgreSQL..."

# 1. Leer nueva contraseña del .env
source .env

# 2. Conectarse a PostgreSQL como superuser y cambiar contraseña
docker-compose exec db psql -U postgres -c "ALTER USER banco_user WITH PASSWORD '$DB_PASSWORD';"

echo "✅ Contraseña actualizada!"
echo "🔄 Reiniciando contenedor web..."

# 3. Reiniciar contenedor web para que reintente conexión
docker-compose restart web

echo "✅ Hecho! Verifica los logs con: docker-compose logs -f web"
