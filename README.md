# 🏦 EVA3 - Sistema de Gestión de Clientes Bancarios

[![Django](https://img.shields.io/badge/Django-5.1.3-green.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.15.2-red.svg)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

> **Sistema Full-Stack de Gestión Bancaria** | API REST profesional con Django + Frontend React moderno

Sistema completo de gestión y análisis de clientes bancarios con autenticación JWT, dashboard interactivo, estadísticas avanzadas, seguridad multicapa y despliegue Docker listo para producción.

---

## ✨ Características Principales

### 🎯 Backend (Django REST Framework)
- ✅ **API REST Completa**: CRUD total con ViewSets y filtros avanzados
- ✅ **Autenticación JWT**: Access + Refresh tokens con blacklist
- ✅ **Swagger/OpenAPI**: Documentación interactiva automática en `/api/docs/`
- ✅ **Rate Limiting**: 10,000 req/hora usuarios autenticados, 30 req/hora anónimos
- ✅ **Estadísticas Avanzadas**: Métricas de negocio y análisis de datos
- ✅ **Validaciones Robustas**: Método clean() en modelos + serializers
- ✅ **PostgreSQL + SQLite**: Multi-database support
- ✅ **Gunicorn**: Servidor WSGI optimizado para producción
- ✅ **Testing**: 18 tests con pytest + coverage

### 🎨 Frontend (React + shadcn/ui)
- ✅ **4 Vistas Avanzadas**: Dashboard, Clientes, Análisis, Salud del Cliente
- ✅ **5 Gráficos Interactivos**: Recharts con visualizaciones profesionales
- ✅ **Sistema de Caché**: 90% menos API calls con localStorage persistente
- ✅ **shadcn/ui Components**: UI moderna y accesible
- ✅ **Modo Demo**: Banner y protección visual para portafolios
- ✅ **Filtros Interactivos**: Edad, género, estado con actualización en tiempo real
- ✅ **Alertas Visuales**: Identificación de clientes en riesgo
- ✅ **Responsive Design**: Mobile-first con Tailwind CSS

### 🔒 Seguridad & Protección
- ✅ **Modo Demo**: Middleware de protección para despliegues públicos
- ✅ **4 Capas de Seguridad**: Middleware, Permisos, Rate Limiting, Variables de entorno
- ✅ **Usuario Demo**: Permisos de solo lectura (demo/demo2024)
- ✅ **CORS Configurado**: Orígenes permitidos específicos
- ✅ **Validaciones**: Frontend y backend con mensajes descriptivos

### 🚀 DevOps & Deployment
- ✅ **Docker Compose**: Orquestación multi-container
- ✅ **Dockerfile Multi-Stage**: Build optimizado para producción
- ✅ **Dokploy Compatible**: Variables de entorno unificadas
- ✅ **Scripts Automatizados**: Setup, monitoreo, verificación
- ✅ **Healthchecks**: Monitoreo de servicios
- ✅ **Límites de Recursos**: 512MB RAM por contenedor

---

## 🚀 Quick Start

### Opción 1: Setup Automático (Recomendado)

```bash
git clone https://github.com/sebitabravo/eva3-backend.git
cd eva3-backend
./setup.sh
```

### Opción 2: Docker Compose

```bash
# 1. Clonar y configurar
git clone https://github.com/sebitabravo/eva3-backend.git
cd eva3-backend
cp backend/.env.example .env

# 2. Levantar servicios
docker-compose up -d --build

# 3. Crear usuario admin
docker-compose exec web python manage.py createsuperuser

# 4. (Opcional) Crear usuario demo
docker-compose exec web python manage.py create_demo_user
```

**Acceder:**
- Frontend: http://localhost:5173 (Usuario: admin/admin o demo/demo2024)
- Backend API: http://localhost:8000/api/v1/clientes/
- Swagger Docs: http://localhost:8000/api/docs/
- Admin Panel: http://localhost:8000/admin/

### Opción 3: Desarrollo Local (Sin Docker)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend (nueva terminal)
cd frontend
npm install
npm run dev
```

---

## 📊 Dashboard y Vistas

### 1. Dashboard General
- **Métricas clave**: Total clientes, saldo promedio, edad promedio, cliente top
- **Gráficos**: Distribución por edad, satisfacción y género

### 2. Gestión de Clientes (CRUD)
- **CRUD Completo**: Crear, leer, actualizar, eliminar con modal forms
- **Alertas visuales**: Icono ⚠️ para clientes en riesgo
- **Filtros**: Por género, estado, nivel de satisfacción

### 3. Análisis por Segmentos
- **Filtros interactivos**: Rango de edad (slider), género, estado
- **Gráficos avanzados**:
  - Satisfacción vs Saldo promedio (barras dobles)
  - Edad vs Saldo (scatter plot coloreado)
- **Leyenda semántica**: Colores por nivel de satisfacción

### 4. Salud del Cliente
- **Métricas de riesgo**: Total en riesgo, riesgo alto/medio, valor en riesgo
- **Tabla de clientes en riesgo**: Satisfacción ≤ 2
- **Recomendaciones**: 3 pasos para retención de clientes
- **Acciones rápidas**: Botones Contactar/Llamar

---

## 🔑 Autenticación y Seguridad

### Modo Demo para Portafolio

**Configuración:**
```bash
# Backend (.env)
DEMO_MODE=True
DEBUG=False

# Frontend (.env)
VITE_DEMO_MODE=true
VITE_API_URL=https://tu-dominio.com/api/v1
```

**Características del Modo Demo:**
- 🔒 Middleware bloquea POST/PUT/PATCH/DELETE
- 📖 Solo operaciones de lectura (GET)
- 👁️ Banner amarillo visible "Modo Demostración Activo"
- 🔗 Link a GitHub para ver código completo
- ⚡ Usuario demo sin permisos de escritura

**Crear usuario demo:**
```bash
python manage.py create_demo_user
# Usuario: demo | Password: demo2024
```

### JWT Authentication

```bash
# Obtener token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Usar token
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/v1/clientes/
```

**Configuración JWT:**
- Access Token: 99 minutos
- Refresh Token: 1 día
- Token Blacklist: Habilitado

---

## 📋 API Endpoints

### Autenticación
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/token/` | POST | Obtener access + refresh token |
| `/api/token/refresh/` | POST | Renovar access token |

### CRUD de Clientes
| Endpoint | Métodos | Descripción |
|----------|---------|-------------|
| `/api/v1/clientes/` | GET, POST | Listar y crear clientes |
| `/api/v1/clientes/{id}/` | GET, PUT, PATCH, DELETE | Detalle, actualizar, eliminar |
| `/api/v1/clientes/estadisticas-generales/` | GET | Estadísticas del sistema |
| `/api/v1/clientes/{id}/estadisticas/` | GET | Estadísticas por cliente |

**Filtros disponibles:**
- `?genero=M` - Filtrar por género (M/F)
- `?activo=true` - Filtrar por estado
- `?nivel_de_satisfaccion=5` - Filtrar por satisfacción (1-5)

### Documentación
| Endpoint | Descripción |
|----------|-------------|
| `/api/docs/` | Swagger UI interactivo |
| `/api/redoc/` | Documentación Redoc |
| `/api/schema/` | Schema OpenAPI (JSON) |
| `/admin/` | Panel de administración Django |

---

## 🎯 Rate Limiting

| Tipo | Límite | Descripción |
|------|--------|-------------|
| **Usuarios autenticados** | 10,000/hora | Acceso completo a la API |
| **Usuarios anónimos** | 30/hora | Lectura limitada |
| **Burst** | 100/min | Prevención de ráfagas |
| **Write operations** | 1,000/hora | POST/PUT/PATCH/DELETE |
| **Stats endpoints** | 500/hora | Endpoints de estadísticas |

**Optimización Frontend:**
- Sistema de caché de 15 minutos
- Persistencia en localStorage
- 90% reducción de API calls
- Navegación instantánea entre vistas

---

## 🐳 Docker & Deployment

### Servicios Docker

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **web** | 8000 | Django + Gunicorn |
| **db** | 5432 | PostgreSQL 16 |
| **frontend** | 80 (prod) / 5173 (dev) | React + Vite / Nginx |

### Comandos Docker Útiles

```bash
# Ver logs
docker-compose logs -f
docker-compose logs -f web

# Ejecutar comandos en contenedor
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
docker-compose exec web python manage.py create_demo_user

# Shell de Django/PostgreSQL
docker-compose exec web python manage.py shell
docker-compose exec db psql -U banco_user -d banco_db

# Gestión de contenedores
docker-compose restart
docker-compose down
docker-compose down -v  # Eliminar volúmenes
docker-compose build --no-cache
```

### Despliegue en Dokploy

**Variables de entorno críticas:**
```bash
# Django
DJANGO_SECRET_KEY=generar-uno-nuevo-aqui
DEBUG=False
ALLOWED_HOSTS=tu-dominio.com
DEMO_MODE=True

# Base de datos (nombres simplificados)
DB_ENGINE=postgresql
DB_NAME=banco_db
DB_USER=banco_user
DB_PASSWORD=password-seguro
DB_HOST=db
DB_PORT=5432

# Frontend
NODE_ENV=production
VITE_API_URL=https://tu-dominio.com/api/v1
VITE_DEMO_MODE=true

# Superuser
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=password-admin-seguro
```

**Pasos para Dokploy:**
1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Dokploy detecta automáticamente `docker-compose.yml`
4. Deploy → SSL automático con Let's Encrypt

---

## 📈 Monitoreo

### Script de Monitoreo

```bash
# Estado actual
./monitor-resources.sh status

# Monitoreo continuo (actualiza cada 5s)
./monitor-resources.sh watch

# Ver logs recientes
./monitor-resources.sh logs

# Ver todo
./monitor-resources.sh all
```

**Métricas monitoreadas:**
- CPU y memoria por contenedor
- I/O de red y disco
- Healthchecks de servicios
- Volúmenes Docker
- Alertas automáticas (>80% uso)

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Django 5.1.3
- **API**: Django REST Framework 3.15.2
- **Auth**: djangorestframework-simplejwt 5.3.1
- **Docs**: drf-spectacular 0.27.2
- **Database**: PostgreSQL 16 (prod), SQLite (dev)
- **Server**: Gunicorn 23.0.0
- **Testing**: pytest 8.3.3, pytest-django 4.9.0

### Frontend
- **Framework**: React 18.3.1
- **Build**: Vite 5.4.20
- **UI**: shadcn/ui + Tailwind CSS 3.4.0
- **Charts**: Recharts 2.x
- **HTTP**: Axios 1.12.2
- **Icons**: Lucide React

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL 16 Alpine
- **Web Server**: Gunicorn + Nginx (prod)
- **Process Manager**: Docker

---

## 📦 Estructura del Proyecto

```
eva3-backend/
├── backend/                    # Django REST API
│   ├── banco/                  # Configuración Django
│   │   ├── settings.py         # PostgreSQL, JWT, DRF, Swagger, Middleware
│   │   ├── middleware.py       # DemoModeMiddleware
│   │   └── urls.py             # URLs + Swagger endpoints
│   ├── clientes/               # App principal
│   │   ├── models.py           # Modelo Cliente con validaciones
│   │   ├── views.py            # ViewSet + estadísticas
│   │   ├── serializers.py      # Validaciones
│   │   ├── permissions.py      # Permisos personalizados
│   │   ├── throttling.py       # Rate limiting
│   │   ├── management/commands/
│   │   │   ├── create_demo_user.py  # Usuario demo
│   │   │   └── importar_clientes.py # Importar CSV
│   │   └── tests/              # 18 tests (pytest)
│   ├── Dockerfile              # Multi-stage build
│   ├── docker-entrypoint.sh    # Script de inicio
│   ├── gunicorn.conf.py        # Gunicorn config
│   └── requirements.txt        # Dependencias
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx           # Vista 1: Dashboard general
│   │   │   ├── ClienteList.jsx         # Vista 2: CRUD clientes
│   │   │   ├── AnalysisSegments.jsx    # Vista 3: Análisis filtrado
│   │   │   ├── ClientHealth.jsx        # Vista 4: Salud del cliente
│   │   │   └── ui/                     # shadcn/ui components
│   │   ├── hooks/              # Custom hooks (use-toast)
│   │   ├── lib/                # Utilidades
│   │   └── App.jsx             # Navegación + caché + auth
│   ├── Dockerfile              # Multi-stage con Nginx
│   ├── nginx.conf              # Nginx para producción
│   └── package.json            # Dependencias Node
├── docker-compose.yml          # Orquestación (dev + prod)
├── .env.production             # Template variables producción
├── setup.sh                    # Setup automatizado
├── monitor-resources.sh        # Monitoreo Docker
└── README.md                   # Este archivo
```

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
cd backend
pytest

# Con coverage
pytest --cov

# Ver reporte HTML
pytest --cov --cov-report=html
open htmlcov/index.html
```

**18 tests implementados:**
- Tests unitarios (models.py)
- Tests de integración (API endpoints)
- Coverage: modelos, serializers, views

---

## 📚 Documentación por Módulo

- **[Backend Documentation](backend/README.md)** - API REST completa, testing, análisis de datos
- **[Frontend Documentation](frontend/README.md)** - Dashboard, componentes, sistema de caché

---

## 🏆 Comparación con Evaluaciones Anteriores

| Característica | EVA1 | EVA2 | EVA3 |
|----------------|------|------|------|
| Frontend React completo | ❌ | ❌ | ✅ 4 vistas + shadcn/ui |
| Dashboard interactivo | ❌ | ❌ | ✅ 5 gráficos |
| Sistema de caché | ❌ | ❌ | ✅ 90% menos API calls |
| Modo demo seguro | ❌ | ❌ | ✅ Middleware + permisos |
| JWT Authentication | ❌ | ✅ | ✅ Con blacklist |
| Swagger/OpenAPI | ❌ | ✅ | ✅ drf-spectacular |
| Docker + PostgreSQL | ✅ | ✅ | ✅ Multi-container |
| Rate Limiting | ✅ Básico | ✅ Avanzado | ✅ Optimizado (10k/h) |
| Testing | ❌ | ⚠️ Parcial | ✅ 18 tests + coverage |
| Despliegue Dokploy | ❌ | ❌ | ✅ Variables unificadas |

**Ventaja competitiva de EVA3:**
- Frontend moderno profesional que EVA1 y EVA2 no tienen
- Sistema de seguridad multicapa ideal para portafolios públicos
- Optimización de performance con sistema de caché inteligente

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

## 🎯 Para Reclutadores

**Destacados del proyecto:**
- ✅ Full-stack completo (Django REST + React)
- ✅ 4 vistas avanzadas con visualizaciones profesionales
- ✅ Sistema de seguridad multicapa para despliegues públicos
- ✅ Optimización de performance (90% reducción de API calls)
- ✅ Testing comprehensivo con pytest
- ✅ Docker + CI/CD ready
- ✅ Documentación profesional completa

**Demo en vivo:** [Tu URL de Dokploy aquí]
- Usuario: demo
- Contraseña: demo2024
- Modo solo lectura activado

---

**🎓 Proyecto desarrollado como Evaluación 3 del módulo de Backend - INACAP 2024/2025**
