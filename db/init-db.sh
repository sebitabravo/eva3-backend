#!/bin/bash
# Script de inicialización de PostgreSQL
# Se ejecuta automáticamente al crear el contenedor de base de datos

set -e

echo "🗄️  Inicializando base de datos PostgreSQL..."

# Crear usuario de aplicación si no existe
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Crear usuario de aplicación si no existe
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '${DATABASE_USER:-banco_user}') THEN
            CREATE USER ${DATABASE_USER:-banco_user} WITH PASSWORD '${DATABASE_PASSWORD:-changeme123}';
        END IF;
    END
    \$\$;

    -- Otorgar permisos
    GRANT ALL PRIVILEGES ON DATABASE ${DATABASE_NAME:-banco_db} TO ${DATABASE_USER:-banco_user};
    
    -- Configuraciones de seguridad
    ALTER DATABASE ${DATABASE_NAME:-banco_db} SET timezone TO 'UTC';
    ALTER DATABASE ${DATABASE_NAME:-banco_db} SET client_encoding TO 'UTF8';
    
    -- Extensiones útiles
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
EOSQL

echo "✅ Base de datos inicializada correctamente"
