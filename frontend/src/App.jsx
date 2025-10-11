import { useState, useEffect, useCallback } from 'react';
import ClienteList from './components/ClienteList';
import Dashboard from './components/Dashboard';
import AnalysisSegments from './components/AnalysisSegments';
import ClientHealth from './components/ClientHealth';
import { Toaster } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  HeartPulse, 
  LogOut,
  AlertCircle,
  RefreshCcw,
  Eye,
  Github
} from 'lucide-react';
import axios from 'axios';

// Obtener configuración de runtime o build time
const getRuntimeConfig = () => {
  // Intentar obtener de window.ENV_CONFIG (runtime)
  if (window.ENV_CONFIG && window.ENV_CONFIG.VITE_API_URL !== '__VITE_API_URL__') {
    return {
      apiUrl: window.ENV_CONFIG.VITE_API_URL,
      demoMode: window.ENV_CONFIG.VITE_DEMO_MODE === 'true'
    };
  }
  // Fallback a variables de build time
  return {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    demoMode: import.meta.env.VITE_DEMO_MODE === 'true'
  };
};

const config = getRuntimeConfig();
const API_URL = config.apiUrl;
const DEMO_MODE = config.demoMode;

// Tiempo de caché: 15 minutos (los datos no cambian tan frecuentemente)
const CACHE_DURATION = 15 * 60 * 1000;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState('dashboard');
  const [username, setUsername] = useState(DEMO_MODE ? 'demo' : '');
  const [password, setPassword] = useState(DEMO_MODE ? 'demo2024' : '');
  const [loginError, setLoginError] = useState('');
  
  // Caché compartido de clientes para todas las vistas con persistencia
  const [clientesCache, setClientesCache] = useState(() => {
    try {
      const cached = localStorage.getItem('clientesCache');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  
  const [cacheTimestamp, setCacheTimestamp] = useState(() => {
    const timestamp = localStorage.getItem('cacheTimestamp');
    return timestamp ? parseInt(timestamp) : null;
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Efecto para login automático en modo demo
  useEffect(() => {
    const performDemoLogin = async () => {
      if (DEMO_MODE && !token) {
        console.log('✨ Modo Demo activado, iniciando sesión automáticamente...');
        try {
          const response = await axios.post(`${API_URL.replace('/api/v1', '')}/api/token/`, {
            username: 'demo',
            password: 'demo2024'
          });
          
          const accessToken = response.data.access;
          localStorage.setItem('token', accessToken);
          setToken(accessToken);
          console.log('✅ Login automático exitoso en modo demo');
        } catch (err) {
          console.error('❌ Error en login automático demo:', err);
          console.error('Detalles:', err.response?.data);
        }
      }
    };
    
    performDemoLogin();
  }, [DEMO_MODE, token]);

  // Función para cargar clientes (usada por todas las vistas)
  const fetchClientes = useCallback(async (forceRefresh = false) => {
    // Si tenemos caché válido y no es forzado, usar caché
    if (clientesCache && !forceRefresh && cacheTimestamp) {
      const now = Date.now();
      if (now - cacheTimestamp < CACHE_DURATION) {
        console.log('📦 Usando caché (válido por', Math.round((CACHE_DURATION - (now - cacheTimestamp)) / 60000), 'minutos más)');
        return clientesCache;
      } else {
        console.log('⏰ Caché expirado, recargando...');
      }
    }

    try {
      setIsRefreshing(true);
      console.log('🔄 Cargando datos del servidor...');
      const response = await axios.get(`${API_URL}/clientes/`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { page_size: 5000 }  // Solicitar todos los clientes (máx 5000)
      });

      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      
      // Guardar en estado y localStorage
      setClientesCache(data);
      const timestamp = Date.now();
      setCacheTimestamp(timestamp);
      
      localStorage.setItem('clientesCache', JSON.stringify(data));
      localStorage.setItem('cacheTimestamp', timestamp.toString());
      
      setIsRefreshing(false);
      console.log('✅ Datos cargados y guardados en caché');
      return data;
    } catch (err) {
      console.error('❌ Error fetching clientes:', err);
      setIsRefreshing(false);
      throw err;
    }
  }, [token, clientesCache, cacheTimestamp]);

  // Cargar clientes al iniciar sesión (solo si no hay caché válido)
  useEffect(() => {
    if (token) {
      const now = Date.now();
      const cacheIsValid = clientesCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION);
      
      if (!cacheIsValid) {
        console.log('🚀 Iniciando carga de datos...');
        fetchClientes();
      } else {
        console.log('💾 Usando caché existente');
      }
    }
  }, [token]);

  const handleRefresh = () => {
    console.log('🔄 Refresh manual solicitado');
    fetchClientes(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await axios.post(`${API_URL.replace('/api/v1', '')}/api/token/`, {
        username,
        password
      });
      
      const accessToken = response.data.access;
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      setLoginError('');
    } catch (err) {
      console.error('Error en login:', err);
      setLoginError('Credenciales inválidas. Por favor, intenta nuevamente.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('clientesCache');
    localStorage.removeItem('cacheTimestamp');
    setToken(null);
    setUsername('');
    setPassword('');
    setCurrentView('dashboard');
    setClientesCache(null);
    setCacheTimestamp(null);
    console.log('👋 Sesión cerrada y caché limpiado');
  };

  // Login Screen
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            {DEMO_MODE && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <Eye className="h-4 w-4" />
                  <span className="font-semibold text-sm">Modo Demostración</span>
                </div>
                <p className="text-xs text-amber-700">
                  Este es un proyecto de portafolio. Las operaciones de escritura están deshabilitadas para proteger el sistema.
                </p>
              </div>
            )}
            
            <CardTitle className="text-2xl font-bold text-center">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center">
              {DEMO_MODE ? 'Explora el sistema de gestión de clientes' : 'Accede al sistema de gestión de clientes'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-800 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4" />
                <span>{loginError}</span>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={DEMO_MODE}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={DEMO_MODE}
                />
              </div>
              
              <Button type="submit" className="w-full gap-2">
                {DEMO_MODE && <Eye className="h-4 w-4" />}
                {DEMO_MODE ? 'Ver Demo' : 'Iniciar Sesión'}
              </Button>
            </form>
            
            {DEMO_MODE ? (
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-center text-green-900 font-semibold mb-2">
                    ✓ Acceso automático en modo demo
                  </p>
                  <p className="text-xs text-center text-green-800">
                    Solo puedes ver datos. Las operaciones de escritura están protegidas.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-center text-gray-700 mb-2">
                    ¿Quieres probar todas las funciones?
                  </p>
                  <a 
                    href="https://github.com/sebitabravo/eva3-backend" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Github className="h-4 w-4" />
                    Clona el proyecto en GitHub
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-center text-blue-900">
                  <strong>Usuario de prueba:</strong> admin<br />
                  <strong>Contraseña:</strong> admin
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  // Main App with Navigation
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'analysis', label: 'Análisis', icon: BarChart3 },
    { id: 'health', label: 'Salud del Cliente', icon: HeartPulse },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Demo Mode Banner */}
      {DEMO_MODE && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 text-center text-sm font-medium shadow-md">
          <div className="flex items-center justify-center gap-2">
            <Eye className="h-4 w-4" />
            <span>
              Modo Demostración Activo - Solo lectura | Las operaciones de escritura están deshabilitadas para proteger el proyecto
            </span>
            <a 
              href="https://github.com/sebitabravo/eva3-backend" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-4 underline hover:text-amber-100 flex items-center gap-1"
            >
              <Github className="h-3 w-3" />
              Ver en GitHub
            </a>
          </div>
        </div>
      )}
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
                <span className="text-xl font-bold text-gray-900">Sistema de Clientes</span>
                {DEMO_MODE && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                    DEMO
                  </span>
                )}
              </div>
              
              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      variant={currentView === item.id ? "default" : "ghost"}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Cache status indicator */}
              {cacheTimestamp && (
                <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>
                    Caché: {Math.round((Date.now() - cacheTimestamp) / 60000)} min
                  </span>
                </div>
              )}
              
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm" 
                className="gap-2"
                disabled={isRefreshing}
                title="Actualizar datos del servidor"
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                </span>
              </Button>
              
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                variant={currentView === item.id ? "default" : "ghost"}
                size="sm"
                className="gap-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {currentView === 'dashboard' && <Dashboard token={token} clientesCache={clientesCache} fetchClientes={fetchClientes} />}
        {currentView === 'clientes' && <ClienteList token={token} clientesCache={clientesCache} fetchClientes={fetchClientes} onUpdate={handleRefresh} />}
        {currentView === 'analysis' && <AnalysisSegments token={token} clientesCache={clientesCache} fetchClientes={fetchClientes} />}
        {currentView === 'health' && <ClientHealth token={token} clientesCache={clientesCache} fetchClientes={fetchClientes} />}
      </main>

      <Toaster />
    </div>
  );
}

export default App;
