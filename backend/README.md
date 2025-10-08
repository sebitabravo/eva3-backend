# 🏦 Backend - Sistema de Gestión de Clientes Bancarios

[![Django](https://img.shields.io/badge/Django-5.1.3-green.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.15.2-red.svg)](https://www.django-rest-framework.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

> **EVA3 - Evaluación Backend INACAP** | API RESTful completa para gestión y análisis de clientes bancarios con autenticación JWT, estadísticas avanzadas y documentación Swagger.

---

## 📖 Descripción del Proyecto

Sistema de gestión de clientes bancarios desarrollado como **Evaluación 3 del módulo de Backend** en INACAP. Permite administrar información de clientes, analizar datos bancarios, generar estadísticas de negocio y proporcionar insights sobre la cartera de clientes.

### Contexto de Negocio

El sistema gestiona información crítica de clientes bancarios incluyendo:
- **Datos demográficos**: Edad, género
- **Información financiera**: Saldo de cuenta, estado activo/inactivo
- **Métricas de satisfacción**: Nivel de satisfacción del cliente (escala 1-5)
- **Análisis de datos**: Jupyter notebooks para análisis exploratorio
- **Importación masiva**: Carga de datos desde archivos CSV

---

## ✨ Características Principales

### Core Backend
- ✅ **API REST Completa**: CRUD total con Django REST Framework
- ✅ **Autenticación JWT**: Access + Refresh tokens con blacklist
- ✅ **Swagger/OpenAPI**: Documentación interactiva automática (`/api/docs/`)
- ✅ **PostgreSQL**: Base de datos robusta para producción
- ✅ **SQLite**: Soporte para desarrollo local

### Seguridad & Control
- ✅ **Rate Limiting**: 6 tipos de throttling diferenciado
- ✅ **Custom Permissions**: Control granular de acceso (ownership)
- ✅ **Validaciones Robustas**: Método `clean()` en modelos + serializers
- ✅ **CORS Configurado**: Para integración con frontend

### Análisis & Estadísticas
- ✅ **Estadísticas Avanzadas**: Top 5, rankings, distribuciones
- ✅ **Análisis de Datos**: Jupyter notebooks para exploración
- ✅ **Métricas de Negocio**: Satisfacción, rentabilidad, demografía
- ✅ **Importación CSV**: Carga masiva de datos desde archivos

### DevOps & Deployment
- ✅ **Docker**: Containerización completa con Gunicorn
- ✅ **Testing**: 18 tests con pytest + coverage
- ✅ **Scripts**: Setup, monitoreo, verificación automatizados
- ✅ **CI/CD Ready**: Configuración para producción

---

## 🗄️ Modelo de Datos

### Cliente

Representa un cliente bancario con toda su información relevante:

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|------------|
| `cliente_id` | AutoField | Identificador único (PK) | Auto-generado |
| `usuario` | ForeignKey | Usuario propietario (Django User) | Opcional, permite multi-usuario |
| `edad` | Integer | Edad del cliente | 18-120 años |
| `genero` | CharField(1) | M (Masculino) / F (Femenino) | Requerido |
| `saldo` | Decimal(100,2) | Saldo de cuenta bancaria | >= 0 |
| `activo` | Boolean | Estado del cliente | Default: True |
| `nivel_de_satisfaccion` | Integer | Satisfacción del cliente | 1-5 (1=Muy Insatisfecho, 5=Muy Satisfecho) |

**Validaciones Implementadas:**
```python
# En models.py
def clean(self):
    - Edad: 18-120 años
    - Saldo: no negativo
    - Satisfacción: 1-5

# En serializers.py
validate_edad()
validate_saldo()
validate_nivel_de_satisfaccion()

# En permissions.py
- Límite: 100 clientes por usuario no-admin
- Ownership: Solo propietario o admin puede editar/eliminar
```

---

## 🚀 Instalación

### Opción 1: Desarrollo Local (sin Docker)

```bash
# 1. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar base de datos
python manage.py migrate

# 4. Crear superusuario
python manage.py createsuperuser

# 5. (Opcional) Importar datos de prueba desde CSV
python manage.py importar_clientes clientes_limpios.csv

# 6. Colectar estáticos
python manage.py collectstatic --noinput

# 7. Iniciar servidor
python manage.py runserver
```

### Opción 2: Con Docker (recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up -d --build

# El backend estará disponible en http://localhost:8000
```

---

## 📋 API Endpoints

### Autenticación

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/token/` | POST | Obtener access + refresh token |
| `/api/token/refresh/` | POST | Renovar access token |

**Ejemplo de Login:**
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### CRUD de Clientes

| Endpoint | Métodos | Descripción | Throttle |
|----------|---------|-------------|----------|
| `/api/v1/clientes/` | GET | Listar clientes | 200/hora |
| `/api/v1/clientes/` | POST | Crear cliente | 50/hora |
| `/api/v1/clientes/{id}/` | GET | Detalle de cliente | 200/hora |
| `/api/v1/clientes/{id}/` | PUT | Actualizar cliente completo | 50/hora |
| `/api/v1/clientes/{id}/` | PATCH | Actualizar parcial | 50/hora |
| `/api/v1/clientes/{id}/` | DELETE | Eliminar cliente | 50/hora |

**Filtros disponibles:**
- `?genero=M` - Filtrar por género (M/F)
- `?activo=true` - Filtrar por estado activo
- `?nivel_de_satisfaccion=5` - Filtrar por satisfacción (1-5)
- `?page=2&page_size=50` - Paginación

### Estadísticas

| Endpoint | Método | Descripción | Throttle |
|----------|--------|-------------|----------|
| `/api/v1/clientes/{id}/estadisticas/` | GET | Estadísticas de cliente | 20/hora |
| `/api/v1/clientes/estadisticas-generales/` | GET | Estadísticas del sistema | 20/hora |

**Estadísticas de Cliente Individual:**
```json
{
  "cliente_id": 1,
  "edad": 35,
  "genero": "Masculino",
  "saldo": 15000.50,
  "activo": true,
  "nivel_de_satisfaccion": 4,
  "nivel_satisfaccion_texto": "Satisfecho",
  "ranking_saldo": "Top 25.5%",
  "comparacion_promedio": {
    "edad": {
      "cliente": 35,
      "promedio": 42.3,
      "diferencia": -7.3
    },
    "saldo": {
      "cliente": 15000.50,
      "promedio": 8500.00,
      "diferencia": 6500.50
    }
  }
}
```

**Estadísticas Generales del Sistema:**
```json
{
  "total_clientes": 150,
  "clientes_activos": 135,
  "clientes_inactivos": 15,
  "porcentaje_activos": 90.0,
  "por_genero": {
    "masculino": 75,
    "femenino": 75
  },
  "por_satisfaccion": {
    "muy_insatisfecho": 5,
    "insatisfecho": 15,
    "neutral": 35,
    "satisfecho": 60,
    "muy_satisfecho": 35
  },
  "promedio_edad": 42.5,
  "promedio_saldo": 8500.75,
  "saldo_total": 1275112.50,
  "saldo_maximo": 50000.00,
  "saldo_minimo": 100.00,
  "top_5_clientes_por_saldo": [...],
  "por_rango_edad": {
    "18-30": 30,
    "31-45": 60,
    "46-60": 45,
    "61-80": 15,
    "81+": 0
  },
  "satisfaccion_por_genero": {...},
  "tasa_satisfaccion_general": 63.33,
  "clientes_alta_rentabilidad": 15,
  "porcentaje_alta_rentabilidad": 10.0
}
```

### Documentación

| Endpoint | Descripción |
|----------|-------------|
| `/api/docs/` | Swagger UI interactivo |
| `/api/redoc/` | Documentación Redoc |
| `/api/schema/` | Schema OpenAPI (JSON) |
| `/admin/` | Panel de administración Django |

---

## 🔐 Autenticación & Permisos

### JWT Authentication

El sistema usa JWT (JSON Web Tokens) con las siguientes características:
- **Access Token**: Válido por 99 minutos
- **Refresh Token**: Válido por 1 día
- **Token Rotation**: Los refresh tokens se rotan automáticamente
- **Blacklist**: Tokens revocados se almacenan en blacklist

### Permissions Personalizados

```python
# IsOwnerOrAdmin
- Admin: acceso completo
- Usuario: solo sus propios clientes

# IsAdminOrReadOnly
- Admin: puede escribir
- Usuarios: solo lectura

# CanCreateCliente
- Límite: 100 clientes por usuario no-admin
- Admin: sin límite
```

---

## 🛡️ Rate Limiting

Protección anti-abuso con 6 tipos de throttling:

| Tipo | Límite | Aplica a |
|------|--------|----------|
| **AnonRateThrottle** | 100/hora | Usuarios no autenticados |
| **UserRateThrottle** | 1000/hora | Usuarios autenticados |
| **BurstRateThrottle** | 30/minuto | Todas las peticiones (anti-ráfagas) |
| **ReadOnlyRateThrottle** | 200/hora | Operaciones GET |
| **WriteRateThrottle** | 50/hora | POST/PUT/PATCH/DELETE |
| **StatsRateThrottle** | 20/hora | Endpoints de estadísticas (costosos) |

---

## 📊 Análisis de Datos

### Jupyter Notebooks

El proyecto incluye análisis exploratorio de datos:

```bash
# Iniciar Jupyter Notebook
jupyter notebook
```

**Notebooks disponibles:**
- `Untitled.ipynb` - Análisis exploratorio de clientes bancarios

### Script de Análisis

```bash
# Ejecutar análisis y limpieza de datos
python analisis_datos.py
```

**Procesos incluidos:**
- Limpieza de datos (duplicados, nulos)
- Imputación de valores faltantes (mediana, moda)
- Conversión de tipos de datos
- Generación de CSV limpio

### Importación de Datos

```bash
# Importar clientes desde CSV
python manage.py importar_clientes clientes_limpios.csv

# Formato esperado del CSV:
# Edad,Genero,Saldo,Activo,Nivel_de_Satisfaccion
# 35,M,5000.50,True,4
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
pytest

# Con coverage
pytest --cov

# Tests específicos
pytest clientes/tests/test_models.py
pytest clientes/tests/test_api.py

# Verbose
pytest -v
```

### Tests Implementados

**Tests Unitarios (test_models.py):**
- ✅ Crear cliente válido
- ✅ Validación de edad mínima/máxima
- ✅ Validación de saldo negativo
- ✅ Validación de nivel de satisfacción
- ✅ Representación string
- ✅ Display de género

**Tests de Integración (test_api.py):**
- ✅ Listar clientes (autenticado/no autenticado)
- ✅ Crear cliente
- ✅ Crear cliente con datos inválidos
- ✅ Actualizar cliente
- ✅ Eliminar cliente
- ✅ Estadísticas de cliente
- ✅ Estadísticas generales

**Total: 18 tests**

### Coverage

```bash
# Generar reporte HTML
pytest --cov --cov-report=html

# Ver reporte
open htmlcov/index.html
```

---

## ⚙️ Configuración

### Variables de Entorno (.env)

```bash
# Django Core
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=localhost,yourdomain.com

# Database (PostgreSQL)
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=banco_db
DATABASE_USER=banco_user
DATABASE_PASSWORD=secure_password_here
DATABASE_HOST=db
DATABASE_PORT=5432

# JWT (minutos)
JWT_ACCESS_TOKEN_LIFETIME=99
JWT_REFRESH_TOKEN_LIFETIME=1440

# Gunicorn
GUNICORN_WORKERS=2
GUNICORN_THREADS=2
GUNICORN_TIMEOUT=120

# Rate Limiting
THROTTLE_ANON_RATE=100/hour
THROTTLE_USER_RATE=1000/hour
```

---

## 🔧 Comandos Útiles

### Django Management

```bash
# Migraciones
python manage.py makemigrations
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Colectar estáticos
python manage.py collectstatic --noinput

# Shell interactivo
python manage.py shell

# Importar datos
python manage.py importar_clientes <archivo.csv>
```

### Docker

```bash
# Construir y levantar servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f web

# Ejecutar comando en contenedor
docker-compose exec web python manage.py migrate

# Acceder a shell
docker-compose exec web bash
docker-compose exec web python manage.py shell

# Detener servicios
docker-compose down

# Limpiar todo (incluyendo volúmenes)
docker-compose down -v
```

---

## 📁 Estructura del Proyecto

```
backend/
├── banco/                      # Configuración Django
│   ├── settings.py             # Settings (PostgreSQL, JWT, DRF, Swagger)
│   ├── urls.py                 # URLs principales + Swagger
│   └── wsgi.py                 # WSGI config para Gunicorn
├── clientes/                   # App principal
│   ├── models.py               # Modelo Cliente con validaciones
│   ├── views.py                # ViewSet + endpoints estadísticas
│   ├── serializers.py          # Serializers con validaciones
│   ├── permissions.py          # Permissions personalizados
│   ├── throttling.py           # Throttling personalizado
│   ├── urls.py                 # Router DRF
│   ├── admin.py                # Admin Django
│   ├── filters.py              # Filtros personalizados
│   ├── management/             # Comandos personalizados
│   │   └── commands/
│   │       └── importar_clientes.py
│   └── tests/                  # Tests
│       ├── test_models.py      # Tests unitarios
│       └── test_api.py         # Tests de integración
├── clientes_templates/         # Vistas HTML Django (opcional)
├── static/                     # Archivos estáticos
├── Dockerfile                  # Multi-stage build
├── docker-entrypoint.sh        # Script de inicio
├── gunicorn.conf.py            # Configuración Gunicorn
├── pytest.ini                  # Configuración pytest
├── requirements.txt            # Dependencias Python
├── manage.py                   # Django CLI
├── analisis_datos.py           # Script análisis de datos
├── clientes_banco.csv          # Datos originales
├── clientes_limpios.csv        # Datos procesados
└── Untitled.ipynb              # Jupyter notebook análisis
```

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Framework** | Django | 5.1.3 |
| **API** | Django REST Framework | 3.15.2 |
| **Auth** | djangorestframework-simplejwt | 5.3.1 |
| **Docs** | drf-spectacular | 0.27.2 |
| **Database** | PostgreSQL | 16 (prod) |
| | SQLite | 3 (dev) |
| **Server** | Gunicorn | 23.0.0 |
| **Container** | Docker | Latest |
| **Testing** | pytest | 8.3.3 |
| | pytest-django | 4.9.0 |
| | pytest-cov | 6.0.0 |
| **Analysis** | pandas | 2.2.2 |
| | jupyter | 1.0.0 |
| **Code Quality** | black | 24.10.0 |
| | flake8 | 7.1.1 |

---

## 📚 Documentación Adicional

- **[README Principal](../README.md)** - Documentación completa del proyecto
- **[Conexión Frontend-Backend](../README_CONEXION.md)** - Guía de integración
- **[Funcionalidades CRUD](../FUNCIONALIDADES_CRUD.md)** - Detalle de operaciones
- **[Comparación Evaluaciones](../COMPARACION_EVALUACIONES.md)** - EVA1 vs EVA2 vs EVA3

---

## 🤝 Contribuir

Este es un proyecto académico de evaluación. No se aceptan contribuciones externas.

---

## 📄 Licencia

Proyecto académico - INACAP 2024/2025

---

## 👨‍💻 Autor

**Sebastián Bravo**
- GitHub: [@sebitabravo](https://github.com/sebitabravo)
- Evaluación 3 - Backend INACAP

---

## 🎓 Contexto Académico

**Asignatura**: Backend / Desarrollo de Aplicaciones Web
**Institución**: INACAP
**Evaluación**: EVA3 - Evaluación Final
**Año**: 2024-2025

---

**🏦 Sistema de Gestión de Clientes Bancarios - Backend API**