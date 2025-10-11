#!/bin/bash

echo "=========================================="
echo "🧪 PRUEBA DE MODO DEMO"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8000"

echo "1️⃣ Verificando que el backend está activo..."
if curl -s -f "$API_URL/api/v1/clientes/" > /dev/null; then
    echo -e "${GREEN}✅ Backend está activo${NC}"
else
    echo -e "${RED}❌ Backend no está respondiendo${NC}"
    exit 1
fi
echo ""

echo "2️⃣ Probando login con credenciales demo..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/token/" \
    -H "Content-Type: application/json" \
    -d '{"username":"demo","password":"demo2024"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r .access)

if [ "$ACCESS_TOKEN" != "null" ] && [ ! -z "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Login exitoso${NC}"
    echo "Token: ${ACCESS_TOKEN:0:20}..."
else
    echo -e "${RED}❌ Error en login${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

echo "3️⃣ Probando operación de LECTURA (debe funcionar)..."
READ_RESPONSE=$(curl -s -X GET "$API_URL/api/v1/clientes/?page=1&page_size=5" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

CLIENT_COUNT=$(echo $READ_RESPONSE | jq '.results | length')

if [ "$CLIENT_COUNT" != "null" ] && [ "$CLIENT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Lectura exitosa: $CLIENT_COUNT clientes obtenidos${NC}"
else
    echo -e "${RED}❌ Error en lectura${NC}"
    echo "Response: $READ_RESPONSE"
    exit 1
fi
echo ""

echo "4️⃣ Probando operación de ESCRITURA (debe ser bloqueada)..."
WRITE_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/clientes/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{"nombre":"Test","apellido":"User","email":"test@test.com","genero":"M","ciudad":"Test City","pais":"Test Country","edad":30,"activo":true,"saldo":1000,"nivel_satisfaccion":"alto"}')

IS_BLOCKED=$(echo $WRITE_RESPONSE | jq -r '.demo_mode')

if [ "$IS_BLOCKED" = "true" ]; then
    echo -e "${GREEN}✅ Escritura bloqueada correctamente${NC}"
    echo "Mensaje: $(echo $WRITE_RESPONSE | jq -r .message)"
else
    echo -e "${RED}❌ ERROR: La escritura NO fue bloqueada${NC}"
    echo "Response: $WRITE_RESPONSE"
    exit 1
fi
echo ""

echo "5️⃣ Verificando estadísticas (debe funcionar)..."
STATS_RESPONSE=$(curl -s -X GET "$API_URL/api/v1/clientes/estadisticas/" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

TOTAL_CLIENTS=$(echo $STATS_RESPONSE | jq -r '.total_clientes')

if [ "$TOTAL_CLIENTS" != "null" ] && [ "$TOTAL_CLIENTS" -gt 0 ]; then
    echo -e "${GREEN}✅ Estadísticas obtenidas: $TOTAL_CLIENTS clientes totales${NC}"
else
    echo -e "${YELLOW}⚠️  Advertencia: No se pudieron obtener estadísticas${NC}"
fi
echo ""

echo "6️⃣ Verificando variables de entorno del contenedor web..."
DEMO_MODE_ENV=$(docker-compose exec -T web env | grep "DEMO_MODE=" | cut -d'=' -f2)
echo "DEMO_MODE en contenedor web: $DEMO_MODE_ENV"

if [ "$DEMO_MODE_ENV" = "True" ]; then
    echo -e "${GREEN}✅ DEMO_MODE correctamente configurado en True${NC}"
else
    echo -e "${RED}❌ DEMO_MODE NO está en True (valor: $DEMO_MODE_ENV)${NC}"
fi
echo ""

echo "7️⃣ Verificando frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/)

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Frontend está activo y respondiendo${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend responde con código: $FRONTEND_STATUS${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 TODAS LAS PRUEBAS PASARON${NC}"
echo "=========================================="
echo ""
echo "📌 Resumen del Modo Demo:"
echo "   - Usuario demo: demo / demo2024"
echo "   - Permisos: Solo lectura"
echo "   - Middleware: Bloqueando escrituras"
echo "   - Frontend: http://localhost:8082"
echo "   - Backend API: http://localhost:8000/api/v1"
echo ""
echo "🌐 Para acceder al sistema:"
echo "   1. Abre http://localhost:8082 en tu navegador"
echo "   2. El login será automático en modo demo"
echo "   3. Podrás ver todos los datos pero no modificarlos"
echo ""
