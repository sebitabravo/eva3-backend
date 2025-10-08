#!/bin/bash

# Script de setup automatizado para EVA3
# Facilita la configuración inicial del proyecto

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║       EVA3 - Setup Automatizado                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar Docker
echo -e "${YELLOW}🔍 Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker y Docker Compose están instalados${NC}"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creando archivo .env...${NC}"
    cat > .env << EOF
# Django Core
DEBUG=True
SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 2>/dev/null || echo "django-insecure-$(openssl rand -base64 32)")
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL)
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=banco_db
DATABASE_USER=banco_user
DATABASE_PASSWORD=changeme123
DATABASE_HOST=db
DATABASE_PORT=5432

# JWT Configuration (minutos)
JWT_ACCESS_TOKEN_LIFETIME=99
JWT_REFRESH_TOKEN_LIFETIME=1440

# Gunicorn
GUNICORN_WORKERS=2
GUNICORN_THREADS=2
GUNICORN_TIMEOUT=120

# Ports
HOST_PORT=8000
FRONTEND_PORT=5173

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:8000

# Rate Limiting
THROTTLE_ANON_RATE=100/hour
THROTTLE_USER_RATE=1000/hour
EOF
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
else
    echo -e "${GREEN}✅ Archivo .env ya existe${NC}"
fi

# Detener contenedores existentes
echo -e "${YELLOW}🛑 Deteniendo contenedores existentes...${NC}"
docker-compose down 2>/dev/null || true

# Construir imágenes
echo -e "${YELLOW}🔨 Construyendo imágenes Docker...${NC}"
docker-compose build --no-cache

# Iniciar servicios
echo -e "${YELLOW}🚀 Iniciando servicios...${NC}"
docker-compose up -d

# Esperar a que los servicios estén listos
echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 10

# Ejecutar migraciones
echo -e "${YELLOW}🔄 Ejecutando migraciones...${NC}"
docker-compose exec -T web python manage.py migrate

# Crear superusuario
echo -e "${YELLOW}👤 Creando superusuario (admin/admin)...${NC}"
docker-compose exec -T web python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')
    print('✅ Superusuario creado')
else:
    print('ℹ️  Superusuario ya existe')
EOF

# Colectar estáticos
echo -e "${YELLOW}📦 Recolectando archivos estáticos...${NC}"
docker-compose exec -T web python manage.py collectstatic --noinput

# Mostrar estado
echo -e "\n${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✅ Setup Completado Exitosamente          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}📋 Información de Acceso:${NC}"
echo -e "  🌐 API Backend:      http://localhost:8000/api/v1/"
echo -e "  📚 Swagger UI:       http://localhost:8000/api/docs/"
echo -e "  📖 Redoc:            http://localhost:8000/api/redoc/"
echo -e "  ⚙️  Admin Django:     http://localhost:8000/admin/"
echo -e "  🎨 Frontend React:   http://localhost:5173/"
echo -e "\n  👤 Credenciales:     admin / admin"

echo -e "\n${YELLOW}📊 Comandos Útiles:${NC}"
echo -e "  Ver logs:            docker-compose logs -f"
echo -e "  Detener:             docker-compose down"
echo -e "  Reiniciar:           docker-compose restart"
echo -e "  Monitorear:          ./monitor-resources.sh watch"
echo -e "  Shell Django:        docker-compose exec web python manage.py shell"

echo -e "\n${GREEN}🎉 Todo listo para trabajar!${NC}\n"
