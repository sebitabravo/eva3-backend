#!/bin/bash
# Script para limpiar datos corruptos y re-importar correctamente
# Usa el script corregido que maneja decimales apropiadamente

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🔧 LIMPIEZA Y RE-IMPORTACIÓN DE DATOS               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: Este script debe ejecutarse desde el directorio raíz del proyecto${NC}"
    exit 1
fi

# Mostrar conteo actual
echo -e "${YELLOW}📊 Verificando datos actuales...${NC}"
CURRENT_COUNT=$(docker-compose exec -T web python manage.py shell -c "from clientes.models import Cliente; print(Cliente.objects.count())")
echo -e "Clientes actuales en la base de datos: ${YELLOW}$CURRENT_COUNT${NC}"
echo ""

# Confirmar con el usuario
echo -e "${YELLOW}⚠️  ADVERTENCIA: Esto eliminará TODOS los clientes existentes${NC}"
read -p "¿Deseas continuar? (sí/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Ss]í?$ ]]; then
    echo -e "${BLUE}Operación cancelada${NC}"
    exit 0
fi

# Paso 1: Eliminar todos los clientes
echo -e "${YELLOW}[1/3] Eliminando clientes existentes...${NC}"
docker-compose exec -T web python manage.py shell << 'EOF'
from clientes.models import Cliente
count = Cliente.objects.count()
Cliente.objects.all().delete()
print(f"✅ {count} clientes eliminados")
EOF

echo ""

# Paso 2: Verificar que el archivo CSV existe
echo -e "${YELLOW}[2/3] Verificando archivo CSV...${NC}"
if docker-compose exec -T web test -f clientes_limpios.csv; then
    echo -e "${GREEN}✅ Archivo clientes_limpios.csv encontrado${NC}"
else
    echo -e "${RED}❌ Archivo clientes_limpios.csv no encontrado en el contenedor${NC}"
    echo -e "${YELLOW}Asegúrate de que el archivo existe en backend/clientes_limpios.csv${NC}"
    exit 1
fi

echo ""

# Paso 3: Re-importar datos con el script corregido
echo -e "${YELLOW}[3/3] Importando datos con el script corregido...${NC}"
docker-compose exec web python manage.py importar_clientes clientes_limpios.csv

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                     COMPLETADO                           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Mostrar nuevo conteo
NEW_COUNT=$(docker-compose exec -T web python manage.py shell -c "from clientes.models import Cliente; print(Cliente.objects.count())")
echo -e "${GREEN}✅ Nuevos clientes importados: $NEW_COUNT${NC}"
echo ""

# Comparación
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "Antes:  ${YELLOW}$CURRENT_COUNT${NC} clientes"
echo -e "Después: ${GREEN}$NEW_COUNT${NC} clientes"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
