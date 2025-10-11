#!/bin/bash
set -e

echo "🚀 Iniciando aplicación Django..."

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a PostgreSQL..."
export DATABASE_HOST=${DB_HOST:-db}
export DATABASE_PORT=${DB_PORT:-5432}
export DATABASE_USER=${DB_USER:-banco_user}

# Usar pg_isready que es más confiable
echo "Verificando conexión a PostgreSQL..."
MAX_TRIES=30
COUNTER=0

until pg_isready -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER > /dev/null 2>&1; do
    COUNTER=$((COUNTER+1))
    if [ $COUNTER -gt $MAX_TRIES ]; then
        echo "❌ Error: No se pudo conectar a PostgreSQL después de $MAX_TRIES intentos"
        echo "   Host: $DATABASE_HOST"
        echo "   Port: $DATABASE_PORT"
        echo "   User: $DATABASE_USER"
        exit 1
    fi
    echo "Esperando PostgreSQL... (intento $COUNTER/$MAX_TRIES)"
    sleep 2
done

echo "✅ PostgreSQL está listo!"

# Crear migraciones automáticamente si hay cambios en modelos
echo "🔍 Detectando cambios en modelos..."
python manage.py makemigrations --noinput

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
python manage.py migrate --noinput

# Crear superusuario si no existe
echo "👤 Creando superusuario..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()

username = "${DJANGO_SUPERUSER_USERNAME:-admin}"
email = "${DJANGO_SUPERUSER_EMAIL:-admin@example.com}"
password = "${DJANGO_SUPERUSER_PASSWORD:-admin}"

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f"✅ Superusuario '{username}' creado")
else:
    print(f"ℹ️  Superusuario '{username}' ya existe")
END

# Crear usuario demo si DEMO_MODE está activado
if [ "${DEMO_MODE:-False}" = "True" ]; then
    echo "🎭 Modo DEMO activado - Creando usuario demo..."
    python manage.py create_demo_user
else
    echo "ℹ️  Modo DEMO desactivado"
fi

# ============================================================================
# IMPORTACIÓN INTELIGENTE DE DATOS CON AUTO-CORRECCIÓN
# ============================================================================
CSV_FILE="clientes_limpios.csv"
if [ -f "$CSV_FILE" ]; then
    echo "📊 Verificando integridad de datos..."

    # Contar registros en el CSV (excluyendo header)
    CSV_COUNT=$(tail -n +2 "$CSV_FILE" | wc -l | tr -d ' ')

    # Contar clientes en la base de datos
    CLIENTE_COUNT=$(python manage.py shell -c "from clientes.models import Cliente; print(Cliente.objects.count())")

    echo "   CSV esperado: $CSV_COUNT registros"
    echo "   DB actual:    $CLIENTE_COUNT clientes"

    # Calcular si hay una diferencia significativa (más de 10% de diferencia)
    if [ "$CLIENTE_COUNT" = "0" ]; then
        echo "📥 Base de datos vacía. Importando datos desde $CSV_FILE..."
        python manage.py importar_clientes "$CSV_FILE"

    elif [ "$CLIENTE_COUNT" -lt "$((CSV_COUNT * 90 / 100))" ]; then
        # Si hay menos del 90% de los datos esperados, hay un problema
        echo "⚠️  DATOS INCOMPLETOS DETECTADOS!"
        echo "   Solo se importaron $CLIENTE_COUNT de $CSV_COUNT registros esperados"
        echo "   Esto indica un problema en la importación anterior"
        echo ""
        echo "🔧 Auto-corrección: Limpiando y re-importando datos..."

        # Limpiar datos corruptos
        python manage.py shell << 'CLEANUP_SCRIPT'
from clientes.models import Cliente
count = Cliente.objects.count()
if count > 0:
    print(f"   Eliminando {count} registros incorrectos...")
    Cliente.objects.all().delete()
    print("   ✅ Limpieza completada")
CLEANUP_SCRIPT

        # Re-importar con el script corregido
        echo "   📥 Re-importando datos con el script corregido..."
        python manage.py importar_clientes "$CSV_FILE"

        # Verificar resultado
        NEW_COUNT=$(python manage.py shell -c "from clientes.models import Cliente; print(Cliente.objects.count())")
        echo ""
        if [ "$NEW_COUNT" -ge "$((CSV_COUNT * 95 / 100))" ]; then
            echo "✅ Auto-corrección exitosa: $NEW_COUNT clientes importados"
        else
            echo "⚠️  Auto-corrección parcial: $NEW_COUNT de $CSV_COUNT clientes importados"
            echo "   Revisa los logs para más detalles"
        fi

    else
        echo "✅ Datos completos: $CLIENTE_COUNT clientes (de $CSV_COUNT esperados)"
    fi
else
    echo "⚠️  Archivo $CSV_FILE no encontrado. Continuando sin datos iniciales."
fi
echo "============================================================================"

# Colectar archivos estáticos
echo "📦 Recolectando archivos estáticos..."
python manage.py collectstatic --noinput --clear

echo "🎉 Inicialización completada!"

# Iniciar Gunicorn
echo "🚀 Iniciando Gunicorn..."
exec gunicorn banco.wsgi:application \
    --config /app/gunicorn.conf.py \
    --bind 0.0.0.0:8000 \
    --access-logfile - \
    --error-logfile -
