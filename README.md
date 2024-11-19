# EVA3 Backend Monorepo

Este repositorio contiene un monorepo para un proyecto con un **frontend** basado en Vite (React) y un **backend** construido con Django.

## Estructura del proyecto
  
```plaintext
eva3-backend/
├── frontend/            # Aplicación frontend (Vite + React)
├── db/                  # Estructura de la base de datos (Bosquejo)
├── backend/             # Aplicación backend (Django)
└── pnpm-workspace.yaml  # Configuración de workspaces de pnpm
```

## Requisitos previos

Asegúrate de tener instaladas las siguientes herramientas en tu sistema:

- Node.js 22.11.0
- Pnpm 9.13.2
- Python 3.11.1
- Django 5.1.3

## Instalación

1. **Clona el repositorio**:
```bash
git clone https://github.com/sebitabravo/eva3-backend.git
cd eva3-backend
```

2.  Configura el entorno virtual para el backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

3. Instala las dependencias del frontend:
```bash
cd frontend
pnpm install
cd ..
```

4. Instala las dependencias globales: En la raíz del proyecto:
```bash
pnpm install
```

## Uso
### Ejecutar en modo desarrollo

Para iniciar el frontend y el backend al mismo tiempo:

1. En la raíz del proyecto, ejecuta:
```bash
pnpm dev
```

2. Accede a las siguientes URLs:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)

## Authors

- [@sebitabravo](https://github.com/sebitabravo)
- [](https://github.com/)
- [](https://github.com/)
