# 🏦 EVA3 - Sistema de Gestión de Clientes Bancarios

[![Django](https://img.shields.io/badge/Django-5.1.3-green.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.15.2-red.svg)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

Sistema Full-Stack de gestión bancaria con API REST, dashboard interactivo, JWT y Docker.

---

## 🚀 Quick Start

```bash
git clone https://github.com/sebitabravo/eva3-backend.git
cd eva3-backend
cp backend/.env.example .env
docker-compose up -d --build
docker-compose exec web python manage.py createsuperuser
```

**Acceder:**
- Frontend: http://localhost:5173
- API: http://localhost:8000/api/v1/clientes/
- Swagger: http://localhost:8000/api/docs/

**Desarrollo local:**
```bash
# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python manage.py migrate
python manage.py createsuperuser && python manage.py runserver

# Frontend
cd frontend && npm install && npm run dev
```

---

## ✨ Características

**Backend:** API REST completa, JWT (99min access + 1d refresh), Swagger, Rate Limiting (10k/h autenticados), PostgreSQL/SQLite, 18 tests pytest

**Frontend:** 4 vistas (Dashboard, CRUD, Análisis, Salud), 5 gráficos Recharts, caché 90% menos API calls, shadcn/ui + Tailwind

**Seguridad:** Middleware demo, permisos personalizados, rate limiting, CORS configurado

---

## 📋 API Endpoints

| Endpoint | Métodos | Descripción |
|----------|---------|-------------|
| `/api/token/` | POST | JWT tokens |
| `/api/token/refresh/` | POST | Renovar token |
| `/api/v1/clientes/` | GET, POST | Listar/crear |
| `/api/v1/clientes/{id}/` | GET, PUT, PATCH, DELETE | CRUD |
| `/api/v1/clientes/estadisticas-generales/` | GET | Stats sistema |
| `/api/v1/clientes/{id}/estadisticas/` | GET | Stats cliente |

**Filtros:** `?genero=M`, `?activo=true`, `?nivel_de_satisfaccion=5`

---

## 📊 Vistas Frontend

**Dashboard:** Métricas + gráficos (edad, satisfacción, género)

**Clientes (CRUD):** Crear/editar/eliminar, alertas riesgo, filtros

**Análisis:** Filtros edad/género/estado + gráficos (Satisfacción vs Saldo, Edad vs Saldo)

**Salud:** Métricas riesgo, tabla clientes riesgo, acciones Contactar/Llamar

---

## 🔑 Modo Demo

```bash
# Backend (.env)
DEMO_MODE=True
DEBUG=False

# Frontend (.env)
VITE_DEMO_MODE=true
VITE_API_URL=https://tu-dominio.com/api/v1
```

```bash
python manage.py create_demo_user  # demo/demo2024
```

Middleware bloquea POST/PUT/PATCH/DELETE, banner visible, solo lectura

---

## 🐳 Docker & Deployment

**Servicios:** web (Django:8000), db (PostgreSQL:5432), frontend (React:80/5173)

```bash
docker-compose logs -f web
docker-compose exec web python manage.py migrate
docker-compose restart
docker-compose down -v
```

**Variables Producción:**
```bash
DJANGO_SECRET_KEY=nuevo-secreto
DEBUG=False
ALLOWED_HOSTS=tu-dominio.com
DB_ENGINE=postgresql
DB_NAME=banco_db
DB_USER=banco_user
DB_PASSWORD=password-seguro
DB_HOST=db
NODE_ENV=production
VITE_API_URL=https://tu-dominio.com/api/v1
```

---

## 🛠️ Stack

**Backend:** Django 5.1.3, DRF 3.15.2, JWT 5.3.1, drf-spectacular 0.27.2, PostgreSQL 16, Gunicorn 23.0.0, pytest 8.3.3

**Frontend:** React 18.3.1, Vite 5.4.20, Tailwind 3.4.18, shadcn/ui, Recharts 3.2.1, Axios 1.7.7

**Infra:** Docker, PostgreSQL Alpine, Nginx

---

## 📦 Estructura

```
eva3-backend/
├── backend/
│   ├── banco/                  # Config (settings.py, middleware.py, urls.py)
│   ├── clientes/               # App (models, views, serializers, permissions, tests)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/         # Dashboard, ClienteList, Analysis, Health, ui/
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## 🧪 Testing

```bash
cd backend
pytest                          # Todos
pytest --cov                    # Coverage
pytest --cov --cov-report=html  # HTML report
```

18 tests: Modelos, API, estadísticas

---

## 📚 Documentación

- [Backend README](backend/README.md) - API REST, testing
- [Frontend README](frontend/README.md) - Dashboard, caché

---

**Sebastián Bravo** [@sebitabravo](https://github.com/sebitabravo) | Evaluación 3 Backend INACAP 2024/2025
