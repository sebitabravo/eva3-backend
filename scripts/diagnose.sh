#!/bin/bash
# Script de diagnóstico del sistema
# Recopila información útil para troubleshooting

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🔍 DIAGNÓSTICO DEL SISTEMA BANCARIO                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Versiones de Docker
echo -e "${YELLOW}[1/8] Versiones de Docker${NC}"
docker --version
docker-compose --version
echo ""

# 2. Estado de contenedores
echo -e "${YELLOW}[2/8] Estado de Contenedores${NC}"
docker-compose ps
echo ""

# 3. Variables de entorno (sin contraseñas)
echo -e "${YELLOW}[3/8] Variables de Entorno (contraseñas ocultas)${NC}"
if [ -f .env ]; then
    grep -E "^DB_|^DJANGO_|^VITE_" .env | sed 's/PASSWORD=.*/PASSWORD=***OCULTO***/g' | sed 's/SECRET_KEY=.*/SECRET_KEY=***OCULTO***/g'
else
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
fi
echo ""

# 4. Healthcheck de PostgreSQL
echo -e "${YELLOW}[4/8] Salud de PostgreSQL${NC}"
if docker-compose exec -T db pg_isready -U banco_user -d banco_db 2>/dev/null; then
    echo -e "${GREEN}✅ PostgreSQL está respondiendo${NC}"
else
    echo -e "${RED}❌ PostgreSQL no está respondiendo${NC}"
fi
echo ""

# 5. Usuarios de PostgreSQL
echo -e "${YELLOW}[5/8] Usuarios en PostgreSQL${NC}"
docker-compose exec -T db psql -U postgres -c "\du" 2>/dev/null || echo -e "${RED}❌ No se puede conectar a PostgreSQL${NC}"
echo ""

# 6. Test de conexión al Backend
echo -e "${YELLOW}[6/8] Test de Backend${NC}"
if curl -sf http://localhost:8000/api/v1/clientes/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend respondiendo en http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Backend no responde en http://localhost:8000${NC}"
fi
echo ""

# 7. Test de conexión al Frontend
echo -e "${YELLOW}[7/8] Test de Frontend${NC}"
if curl -sf http://localhost:8082/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend respondiendo en http://localhost:8082${NC}"
else
    echo -e "${RED}❌ Frontend no responde en http://localhost:8082${NC}"
fi
echo ""

# 8. Últimos logs (solo últimas 10 líneas de cada servicio)
echo -e "${YELLOW}[8/8] Últimos Logs${NC}"
echo ""
echo -e "${BLUE}--- PostgreSQL ---${NC}"
docker-compose logs --tail=5 db 2>/dev/null || echo -e "${RED}No hay logs disponibles${NC}"
echo ""
echo -e "${BLUE}--- Backend ---${NC}"
docker-compose logs --tail=5 web 2>/dev/null || echo -e "${RED}No hay logs disponibles${NC}"
echo ""
echo -e "${BLUE}--- Frontend ---${NC}"
docker-compose logs --tail=5 frontend 2>/dev/null || echo -e "${RED}No hay logs disponibles${NC}"
echo ""

# Resumen
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     RESUMEN                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Contar problemas
PROBLEMS=0

# Verificar cada componente
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Algunos contenedores no están corriendo${NC}"
    ((PROBLEMS++))
fi

if ! docker-compose exec -T db pg_isready -U banco_user -d banco_db 2>/dev/null; then
    echo -e "${RED}❌ PostgreSQL tiene problemas${NC}"
    ((PROBLEMS++))
fi

if ! curl -sf http://localhost:8000/api/v1/clientes/ > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend no responde${NC}"
    ((PROBLEMS++))
fi

if ! curl -sf http://localhost:8082/ > /dev/null 2>&1; then
    echo -e "${RED}❌ Frontend no responde${NC}"
    ((PROBLEMS++))
fi

if [ $PROBLEMS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Todo parece estar funcionando correctamente!${NC}"
else
    echo -e "${RED}⚠️  Se detectaron $PROBLEMS problema(s)${NC}"
    echo ""
    echo -e "${YELLOW}Consulta la guía de troubleshooting: docs/TROUBLESHOOTING.md${NC}"
    echo -e "${YELLOW}O ejecuta: docker-compose logs -f${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
