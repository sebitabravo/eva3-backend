# 🏦 Backend - API REST Clientes Bancarios

[![Django](https://img.shields.io/badge/Django-5.1.3-green.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.15.2-red.svg)](https://www.django-rest-framework.org/)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)

API RESTful con JWT, estadísticas avanzadas y documentación Swagger.

---

## 🚀 Quick Start

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python manage.py migrate
python manage.py createsuperuser && python manage.py runserver

# Docker
docker-compose up -d --build
docker-compose exec web python manage.py createsuperuser
```

---

## 📋 API Endpoints

**Auth:** `/api/token/` (POST), `/api/token/refresh/` (POST)

**CRUD:** `/api/v1/clientes/` (GET, POST), `/api/v1/clientes/{id}/` (GET, PUT, PATCH, DELETE)

**Stats:** `/api/v1/clientes/estadisticas-generales/` (GET), `/api/v1/clientes/{id}/estadisticas/` (GET)

**Docs:** `/api/docs/` (Swagger), `/api/redoc/` (Redoc), `/admin/` (Django)

**Filtros:** `?genero=M`, `?activo=true`, `?nivel_de_satisfaccion=5`

---

## 🗄️ Modelo Cliente

| Campo | Tipo | Validación |
|-------|------|------------|
| cliente_id | AutoField | PK |
| usuario | ForeignKey | User (opcional) |
| edad | Integer | 18-120 |
| genero | CharField(1) | M/F |
| saldo | Decimal(100,2) | >= 0 |
| activo | Boolean | Default: True |
| nivel_de_satisfaccion | Integer | 1-5 |

**Validaciones:** models.py (`clean()`), serializers.py, permissions.py (límite 100/usuario)

---

## 🔐 Seguridad

**JWT:** Access 99min, Refresh 1d, rotation + blacklist

**Rate Limiting:** anon 30/h, user 10k/h, burst 100/min, write 1k/h, stats 500/h

**Modo Demo:** Middleware bloquea POST/PUT/PATCH/DELETE
```bash
DEMO_MODE=True
DEBUG=False
```

---

## 🧪 Testing

```bash
pytest                          # Todos
pytest --cov                    # Coverage
pytest --cov --cov-report=html  # HTML
```

**18 tests:** Modelos, API CRUD, auth, permisos, stats

---

## 📊 Estadísticas

**Individual:** `/api/v1/clientes/{id}/estadisticas/`
```json
{
  "cliente_id": 1,
  "edad": 35,
  "saldo": 15000.50,
  "nivel_satisfaccion_texto": "Satisfecho",
  "ranking_saldo": "Top 25.5%",
  "comparacion_promedio": {
    "edad": {"cliente": 35, "promedio": 42.3, "diferencia": -7.3},
    "saldo": {"cliente": 15000.50, "promedio": 8500.00, "diferencia": 6500.50}
  }
}
```

**General:** Total clientes, distribución género/satisfacción, promedios, top 5, rangos edad, tasa satisfacción

---

## 📁 Estructura

```
backend/
├── banco/                      # Config (settings, middleware, urls)
├── clientes/                   # App (models, views, serializers, permissions, tests)
├── Dockerfile
└── requirements.txt
```

---

## 🛠️ Stack

**Core:** Django 5.1.3, DRF 3.15.2, JWT 5.3.1, drf-spectacular 0.27.2

**DB:** PostgreSQL 16 (prod), SQLite (dev), psycopg2-binary 2.9.10

**Prod:** Gunicorn 23.0.0, WhiteNoise 6.7.0, django-cors-headers 4.4.0

**Test:** pytest 8.3.3, pytest-django 4.9.0, pytest-cov 6.0.0

**Analysis:** pandas 2.2.2, jupyter 1.0.0

---

## ⚙️ Variables de Entorno

```bash
DEBUG=False
DJANGO_SECRET_KEY=your-secret
ALLOWED_HOSTS=localhost,domain.com
DB_ENGINE=postgresql
DB_NAME=banco_db
DB_USER=banco_user
DB_PASSWORD=password
DB_HOST=db
DB_PORT=5432
JWT_ACCESS_TOKEN_LIFETIME=99
JWT_REFRESH_TOKEN_LIFETIME=1440
DEMO_MODE=True
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://domain.com
```

---

## 🔧 Comandos

```bash
python manage.py makemigrations && python manage.py migrate
python manage.py createsuperuser
python manage.py create_demo_user
python manage.py collectstatic --noinput
python manage.py importar_clientes clientes_limpios.csv
python manage.py shell
```

---

**Sebastián Bravo** [@sebitabravo](https://github.com/sebitabravo) | Evaluación 3 Backend INACAP 2024/2025
