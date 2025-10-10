#!/bin/bash

echo "🔍 Verificando Configuración para Despliegue en Dokploy"
echo "=================================================="
echo ""

# Verificar archivos modificados
echo "📁 Archivos Modificados:"
git diff --stat HEAD 2>/dev/null || echo "No hay cambios sin commit"
echo ""

# Verificar puerto en docker-compose
echo "🔌 Puerto Frontend configurado:"
grep "FRONTEND_PORT" docker-compose.yml || echo "No encontrado"
echo ""

# Verificar Dockerfile del backend
echo "🐳 Dependencias en Backend Dockerfile:"
grep "postgresql-client" backend/Dockerfile && echo "✅ postgresql-client instalado" || echo "❌ postgresql-client falta"
echo ""

# Verificar entrypoint
echo "🚀 Script de Entrypoint:"
grep "pg_isready" backend/docker-entrypoint.sh && echo "✅ pg_isready configurado" || echo "❌ pg_isready no encontrado"
echo ""

# Verificar que init-db.sh no esté montado
echo "🗄️ Verificar init-db.sh:"
if grep -q "init-db.sh:/docker-entrypoint-initdb.d" docker-compose.yml; then
    echo "❌ init-db.sh todavía está montado en PostgreSQL (PROBLEMA)"
else
    echo "✅ init-db.sh NO está montado (correcto)"
fi
echo ""

# Verificar documentación
echo "📚 Documentación:"
[ -f "DEPLOY_DOKPLOY.md" ] && echo "✅ DEPLOY_DOKPLOY.md existe" || echo "❌ DEPLOY_DOKPLOY.md falta"
[ -f "CHANGELOG_DOKPLOY.md" ] && echo "✅ CHANGELOG_DOKPLOY.md existe" || echo "❌ CHANGELOG_DOKPLOY.md falta"
echo ""

echo "=================================================="
echo "✅ Verificación completa!"
echo ""
echo "📋 Próximos pasos:"
echo "1. git add ."
echo "2. git commit -m 'fix: Arreglar problemas de puerto y conexión a DB para Dokploy'"
echo "3. git push origin main"
echo "4. Actualizar variables de entorno en Dokploy"
echo "5. Redesplegar en Dokploy"
echo ""
