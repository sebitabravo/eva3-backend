# 🎨 Frontend - Dashboard Clientes Bancarios

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.20-purple.svg)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4.18-blue.svg)](https://tailwindcss.com/)

SPA moderna con dashboard interactivo, caché inteligente y UI shadcn/ui.

---

## 🚀 Quick Start

```bash
cd frontend
npm install && npm run dev
# http://localhost:5173
```

**Build:** `npm run build && npm run preview`

---

## ✨ Características

**4 Vistas:** Dashboard (métricas + 3 gráficos), Clientes (CRUD + alertas), Análisis (filtros + 2 gráficos), Salud (riesgo + acciones)

**Performance:** Caché 15min localStorage, 90% menos API calls, navegación instantánea

**UI/UX:** shadcn/ui (10+ componentes Radix), Tailwind responsive, Lucide Icons, modo demo

---

## 📊 Vistas

**Dashboard:** Total clientes, saldo/edad promedio. Gráficos: Histograma edad (18-25, 26-35, 36-45, 46-55, 56+), Pastel satisfacción (1-5), Pastel género

**Clientes:** CRUD modales, alertas (⚠️ satisfacción ≤ 2, 🔴 riesgo alto, 🟠 riesgo medio)

**Análisis:** Filtros (edad slider 18-100, género, estado). Gráficos: Barras (Satisfacción vs Saldo), Scatter (Edad vs Saldo)

**Salud:** Métricas riesgo, tabla satisfacción ≤ 2, botones Contactar/Llamar

---

## ⚡ Sistema de Caché

```javascript
const CACHE_DURATION = 15 * 60 * 1000; // 15min

const fetchClientes = useCallback(async (forceRefresh = false) => {
  if (clientesCache && !forceRefresh && cacheTimestamp) {
    const now = Date.now();
    if (now - cacheTimestamp < CACHE_DURATION) return clientesCache;
  }

  const response = await axios.get(`${API_URL}/clientes/`);
  setClientesCache(response.data);
  setCacheTimestamp(Date.now());
  localStorage.setItem('clientesCache', JSON.stringify(response.data));
  localStorage.setItem('cacheTimestamp', Date.now().toString());
  return response.data;
}, [token, clientesCache, cacheTimestamp]);
```

**Beneficios:** API calls 50→5/h (90%), tiempo 2-3s→instantáneo, errores 429→0

---

## 🎨 Diseño

**Colores Satisfacción:**
```javascript
{
  1: '#ef4444', // Rojo
  2: '#f97316', // Naranja
  3: '#eab308', // Amarillo
  4: '#84cc16', // Lima
  5: '#22c55e'  // Verde
}
```

**Componentes:** button, card, dialog, select, switch, badge, table, toast, slider, input

---

## 🔑 Modo Demo

```bash
VITE_DEMO_MODE=true
VITE_API_URL=https://tu-dominio.com/api/v1
```

Banner amarillo, credenciales demo/demo2024, link GitHub, solo lectura

---

## 🛠️ Stack

**Core:** React 18.3.1, Vite 5.4.20

**UI:** @radix-ui/react-* ^1.x, Tailwind 3.4.18, Lucide 0.545.0, clsx 2.1.1

**Charts:** Recharts 3.2.1, Axios 1.7.7

---

## 📁 Estructura

```
frontend/
├── src/
│   ├── components/             # Dashboard, ClienteList, Analysis, Health, ui/
│   ├── App.jsx                 # Navegación + caché
│   └── main.jsx
├── Dockerfile
└── package.json
```

---

## ⚙️ Variables

```bash
# Dev
VITE_API_URL=http://localhost:8000/api/v1
VITE_DEMO_MODE=false

# Prod
VITE_API_URL=https://tu-dominio.com/api/v1
VITE_DEMO_MODE=true
```

---

## 🔧 Scripts

```bash
npm run dev      # Dev (5173)
npm run build    # Build
npm run preview  # Preview
npm run lint     # ESLint
```

---

## 🐛 Troubleshooting

**Module not found:** `npm install recharts @radix-ui/react-slider`

**Gráficos no se muestran:** Backend corriendo, datos en BD, consola F12

**Error 401:** Token localStorage, cerrar sesión, verificar VITE_API_URL

**Caché desactualizado:** Click "Actualizar", borrar localStorage DevTools

---

**Sebastián Bravo** [@sebitabravo](https://github.com/sebitabravo) | Evaluación 3 Backend INACAP 2024/2025
