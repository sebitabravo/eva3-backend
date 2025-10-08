#!/bin/bash

# Script de inicialización de base de datos
# Crea la estructura inicial y datos de prueba si es necesario

set -e

echo "🗄️  Inicializando base de datos..."

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a PostgreSQL..."
until docker-compose exec -T db pg_isready -U ${DATABASE_USER:-banco_user} > /dev/null 2>&1; do
    echo "   Esperando..."
    sleep 1
done

echo "✅ PostgreSQL está listo"

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
docker-compose exec -T web python manage.py migrate --noinput

# Crear superusuario si no existe
echo "👤 Verificando superusuario..."
docker-compose exec -T web python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')
    print('✅ Superusuario "admin" creado')
else:
    print('ℹ️  Superusuario "admin" ya existe')

# Crear usuario de prueba
if not User.objects.filter(username='testuser').exists():
    User.objects.create_user('testuser', 'test@example.com', 'testpass123')
    print('✅ Usuario de prueba "testuser" creado')
else:
    print('ℹ️  Usuario de prueba "testuser" ya existe')
EOF

# Crear datos de prueba (opcional)
echo "📊 ¿Deseas crear datos de prueba? (10 clientes aleatorios) [y/N]"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "📝 Creando datos de prueba..."
    docker-compose exec -T web python manage.py shell << 'EOF'
import random
from django.contrib.auth import get_user_model
from clientes.models import Cliente

User = get_user_model()
admin_user = User.objects.get(username='admin')

# Crear 10 clientes de prueba
generos = ['M', 'F']
created_count = 0

for i in range(10):
    try:
        Cliente.objects.create(
            usuario=admin_user,
            edad=random.randint(18, 80),
            genero=random.choice(generos),
            saldo=round(random.uniform(1000, 50000), 2),
            activo=random.choice([True, True, True, False]),  # 75% activos
            nivel_de_satisfaccion=random.randint(1, 5)
        )
        created_count += 1
    except Exception as e:
        print(f'Error creando cliente {i+1}: {e}')

print(f'✅ {created_count} clientes de prueba creados')
EOF
    echo "✅ Datos de prueba creados"
else
    echo "⏭️  Saltando creación de datos de prueba"
fi

# Colectar estáticos
echo "📦 Recolectando archivos estáticos..."
docker-compose exec -T web python manage.py collectstatic --noinput

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║     ✅ Base de datos inicializada correctamente   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
echo "📋 Credenciales:"
echo "   Admin:     admin / admin"
echo "   Test User: testuser / testpass123"
echo ""
