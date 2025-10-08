#!/bin/bash
set -e

echo "🚀 Iniciando aplicación Django..."

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a PostgreSQL..."
while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
  sleep 0.1
done
echo "✅ PostgreSQL está listo!"

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

# Importar datos desde CSV en producción (si existe el archivo y la DB está vacía)
CSV_FILE="clientes_limpios.csv"
if [ -f "$CSV_FILE" ]; then
    echo "📊 Verificando datos en la base de datos..."
    
    # Contar clientes existentes
    CLIENTE_COUNT=$(python manage.py shell -c "from clientes.models import Cliente; print(Cliente.objects.count())")
    
    if [ "$CLIENTE_COUNT" = "0" ]; then
        echo "📥 Base de datos vacía. Importando datos desde $CSV_FILE..."
        python manage.py importar_clientes "$CSV_FILE"
    else
        echo "ℹ️  Base de datos ya contiene $CLIENTE_COUNT clientes. Omitiendo importación."
    fi
else
    echo "⚠️  Archivo $CSV_FILE no encontrado. Continuando sin datos iniciales."
fi

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
