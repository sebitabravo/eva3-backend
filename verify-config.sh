#!/bin/bash

# Script de verificación de configuración
# Verifica que todas las variables y servicios estén correctos

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║      EVA3 - Verificación de Configuración         ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar archivo .env
echo -e "${YELLOW}🔍 Verificando archivo .env...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Archivo .env existe${NC}"

# Verificar variables críticas
echo -e "\n${YELLOW}🔍 Verificando variables de entorno...${NC}"

check_env_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env | cut -d '=' -f2)
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ Variable ${var_name} no está definida${NC}"
        return 1
    else
        echo -e "${GREEN}✅ ${var_name} está configurada${NC}"
        return 0
    fi
}

# Variables críticas
check_env_var "SECRET_KEY"
check_env_var "DATABASE_NAME"
check_env_var "DATABASE_USER"
check_env_var "DATABASE_PASSWORD"

# Verificar SECRET_KEY no sea la default
SECRET_KEY=$(grep "^SECRET_KEY=" .env | cut -d '=' -f2)
if [[ "$SECRET_KEY" == *"django-insecure"* ]]; then
    echo -e "${YELLOW}⚠️  WARNING: Usando SECRET_KEY insegura (OK para desarrollo)${NC}"
fi

# Verificar Docker
echo -e "\n${YELLOW}🔍 Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker está instalado${NC}"

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker está corriendo${NC}"

# Verificar docker-compose
echo -e "\n${YELLOW}🔍 Verificando Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose está instalado${NC}"

# Verificar estructura de directorios
echo -e "\n${YELLOW}🔍 Verificando estructura del proyecto...${NC}"

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 no existe${NC}"
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1 no existe${NC}"
        return 1
    fi
}

check_directory "backend"
check_directory "frontend"
check_file "backend/Dockerfile"
check_file "frontend/Dockerfile"
check_file "docker-compose.yml"
check_file "backend/requirements.txt"
check_file "backend/manage.py"

# Verificar servicios de Docker
echo -e "\n${YELLOW}🔍 Verificando servicios Docker...${NC}"

if docker ps | grep -q "eva3_web"; then
    echo -e "${GREEN}✅ eva3_web está corriendo${NC}"
    
    # Verificar healthcheck del web
    health=$(docker inspect --format='{{.State.Health.Status}}' eva3_web 2>/dev/null || echo "no-healthcheck")
    if [ "$health" = "healthy" ]; then
        echo -e "${GREEN}   └─ Health: Saludable${NC}"
    elif [ "$health" = "unhealthy" ]; then
        echo -e "${RED}   └─ Health: No saludable${NC}"
    else
        echo -e "${YELLOW}   └─ Health: Sin healthcheck o iniciando${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  eva3_web no está corriendo${NC}"
fi

if docker ps | grep -q "eva3_postgres"; then
    echo -e "${GREEN}✅ eva3_postgres está corriendo${NC}"
    
    # Verificar healthcheck de PostgreSQL
    health=$(docker inspect --format='{{.State.Health.Status}}' eva3_postgres 2>/dev/null || echo "no-healthcheck")
    if [ "$health" = "healthy" ]; then
        echo -e "${GREEN}   └─ Health: Saludable${NC}"
    elif [ "$health" = "unhealthy" ]; then
        echo -e "${RED}   └─ Health: No saludable${NC}"
    else
        echo -e "${YELLOW}   └─ Health: Sin healthcheck o iniciando${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  eva3_postgres no está corriendo${NC}"
fi

# Verificar conectividad de base de datos
if docker ps | grep -q "eva3_postgres" && docker ps | grep -q "eva3_web"; then
    echo -e "\n${YELLOW}🔍 Verificando conectividad de base de datos...${NC}"
    
    if docker-compose exec -T db psql -U $(grep DATABASE_USER .env | cut -d '=' -f2) -d $(grep DATABASE_NAME .env | cut -d '=' -f2) -c '\q' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Conexión a PostgreSQL exitosa${NC}"
    else
        echo -e "${RED}❌ No se puede conectar a PostgreSQL${NC}"
    fi
fi

# Verificar puertos
echo -e "\n${YELLOW}🔍 Verificando puertos...${NC}"

HOST_PORT=$(grep HOST_PORT .env | cut -d '=' -f2 || echo "8000")
FRONTEND_PORT=$(grep FRONTEND_PORT .env | cut -d '=' -f2 || echo "5173")

if lsof -Pi :${HOST_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Puerto ${HOST_PORT} (backend) está en uso${NC}"
else
    echo -e "${YELLOW}⚠️  Puerto ${HOST_PORT} (backend) no está en uso${NC}"
fi

if lsof -Pi :${FRONTEND_PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Puerto ${FRONTEND_PORT} (frontend) está en uso${NC}"
else
    echo -e "${YELLOW}⚠️  Puerto ${FRONTEND_PORT} (frontend) no está en uso${NC}"
fi

# Verificar dependencias de Python
echo -e "\n${YELLOW}🔍 Verificando dependencias críticas...${NC}"

if docker ps | grep -q "eva3_web"; then
    echo -e "${BLUE}Verificando paquetes Python en contenedor...${NC}"
    
    packages=("django" "djangorestframework" "psycopg2" "gunicorn" "drf-spectacular")
    
    for package in "${packages[@]}"; do
        if docker-compose exec -T web pip list 2>/dev/null | grep -qi "$package"; then
            echo -e "${GREEN}✅ $package instalado${NC}"
        else
            echo -e "${RED}❌ $package NO instalado${NC}"
        fi
    done
fi

# Resumen final
echo -e "\n${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✅ Verificación Completada                 ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}📊 Resumen:${NC}"
echo -e "  🌐 Backend:  http://localhost:${HOST_PORT}"
echo -e "  🎨 Frontend: http://localhost:${FRONTEND_PORT}"
echo -e "  📚 Swagger:  http://localhost:${HOST_PORT}/api/docs/"
echo -e "  📖 Redoc:    http://localhost:${HOST_PORT}/api/redoc/"

echo -e "\n${YELLOW}💡 Comandos útiles:${NC}"
echo -e "  docker-compose logs -f      # Ver logs"
echo -e "  ./monitor-resources.sh      # Monitorear recursos"
echo -e "  docker-compose restart      # Reiniciar servicios"
echo -e "\n"
