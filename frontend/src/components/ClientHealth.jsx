import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, TrendingDown, UserX, RefreshCcw, Mail, Phone } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function ClientHealth({ token, clientesCache, fetchClientes }) {
  const [clientes, setClientes] = useState([]);
  const [riskClientes, setRiskClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRisk: 0,
    highRisk: 0,
    mediumRisk: 0,
    totalValue: 0
  });

  useEffect(() => {
    if (clientesCache) {
      processData(clientesCache);
    } else if (token && fetchClientes) {
      loadData();
    }
  }, [clientesCache, token]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchClientes();
      if (data) {
        processData(data);
      }
    } catch (err) {
      console.error('Error loading clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    setLoading(true);
    setClientes(data);
    
    // Filter risk clients (satisfaction level 1 or 2)
    const risk = data.filter(c => c.nivel_de_satisfaccion <= 2);
    setRiskClientes(risk);
    
    // Calculate stats
    const highRisk = risk.filter(c => c.nivel_de_satisfaccion === 1).length;
    const mediumRisk = risk.filter(c => c.nivel_de_satisfaccion === 2).length;
    const totalValue = risk.reduce((sum, c) => sum + parseFloat(c.saldo || 0), 0);
    
    setStats({
      totalRisk: risk.length,
      highRisk,
      mediumRisk,
      totalValue: totalValue.toFixed(2)
    });
    
    setLoading(false);
  };

  const getRiskLevel = (satisfaccion) => {
    return satisfaccion === 1 ? 'high' : 'medium';
  };

  const getRiskBadge = (satisfaccion) => {
    if (satisfaccion === 1) {
      return <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Riesgo Alto
      </Badge>;
    }
    return <Badge variant="outline" className="gap-1 text-orange-600 border-orange-600">
      <TrendingDown className="h-3 w-3" />
      Riesgo Medio
    </Badge>;
  };

  const getSatisfactionText = (nivel) => {
    return nivel === 1 ? 'Muy Insatisfecho' : 'Insatisfecho';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-lg">Cargando análisis de salud...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Salud del Cliente</h2>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Identificación y seguimiento de clientes en riesgo</p>
      </div>

      {/* Risk Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Clientes en Riesgo
            </CardTitle>
            <UserX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">{stats.totalRisk}</div>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">
              {((stats.totalRisk / clientes.length) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Riesgo Alto
            </CardTitle>
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-700">{stats.highRisk}</div>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">Muy insatisfechos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Riesgo Medio
            </CardTitle>
            <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600">{stats.mediumRisk}</div>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">Insatisfechos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Valor en Riesgo
            </CardTitle>
            <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">${stats.totalValue}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="hidden sm:inline">Saldo total en </span>riesgo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      {stats.totalRisk > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">
                  ¡Atención! Clientes que requieren acción inmediata
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Hay {stats.totalRisk} cliente{stats.totalRisk !== 1 ? 's' : ''} con niveles bajos de satisfacción 
                  que podrían abandonar el servicio. Se recomienda contacto urgente del equipo de retención.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Clients Table */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg">Clientes en Riesgo</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Lista de clientes con satisfacción muy baja que requieren atención
              </CardDescription>
            </div>
            <Button onClick={fetchClientes} variant="outline" size="sm" className="gap-1.5 sm:gap-2 w-full sm:w-auto">
              <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Actualizar</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {riskClientes.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Excelente! No hay clientes en riesgo
              </h3>
              <p className="text-gray-500">
                Todos los clientes tienen niveles de satisfacción aceptables
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                <div className="divide-y divide-gray-200">
                  {riskClientes.map((cliente) => (
                    <div
                      key={cliente.cliente_id}
                      className={`p-4 ${getRiskLevel(cliente.nivel_de_satisfaccion) === 'high' ? 'bg-red-50' : 'bg-orange-50'}`}
                    >
                      {/* Header con ID y Nivel de Riesgo */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getRiskLevel(cliente.nivel_de_satisfaccion) === 'high' && (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-semibold text-lg">ID: {cliente.cliente_id}</span>
                        </div>
                        {getRiskBadge(cliente.nivel_de_satisfaccion)}
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Satisfacción:</span>
                          <span className="ml-2">
                            <Badge variant="outline" className="bg-white text-xs">
                              {getSatisfactionText(cliente.nivel_de_satisfaccion)}
                            </Badge>
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Edad:</span>
                          <span className="ml-2 font-medium">{cliente.edad} años</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Género:</span>
                          <span className="ml-2 font-medium">{cliente.genero === 'M' ? 'Masculino' : 'Femenino'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Estado:</span>
                          <span className="ml-2">
                            <Badge variant={cliente.activo ? "default" : "secondary"} className="text-xs">
                              {cliente.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Saldo:</span>
                          <span className="ml-2 font-semibold text-green-600">
                            ${parseFloat(cliente.saldo).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2 flex-1">
                          <Mail className="h-3.5 w-3.5" />
                          Contactar
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2 flex-1">
                          <Phone className="h-3.5 w-3.5" />
                          Llamar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">ID</TableHead>
                          <TableHead className="whitespace-nowrap">Riesgo</TableHead>
                          <TableHead className="whitespace-nowrap">Satisfacción</TableHead>
                          <TableHead className="whitespace-nowrap hidden md:table-cell">Edad</TableHead>
                          <TableHead className="whitespace-nowrap hidden md:table-cell">Género</TableHead>
                          <TableHead className="whitespace-nowrap">Saldo</TableHead>
                          <TableHead className="whitespace-nowrap hidden lg:table-cell">Estado</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {riskClientes.map((cliente) => (
                          <TableRow
                            key={cliente.cliente_id}
                            className={getRiskLevel(cliente.nivel_de_satisfaccion) === 'high' ? 'bg-red-50' : 'bg-orange-50'}
                          >
                            <TableCell className="font-medium whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                {getRiskLevel(cliente.nivel_de_satisfaccion) === 'high' && (
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                )}
                                <span className="text-sm">{cliente.cliente_id}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getRiskBadge(cliente.nivel_de_satisfaccion)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-white text-xs">
                                {getSatisfactionText(cliente.nivel_de_satisfaccion)}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm">{cliente.edad} años</TableCell>
                            <TableCell className="hidden md:table-cell text-sm">{cliente.genero === 'M' ? 'M' : 'F'}</TableCell>
                            <TableCell className="font-semibold whitespace-nowrap text-sm">
                              ${parseFloat(cliente.saldo).toFixed(2)}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant={cliente.activo ? "default" : "secondary"} className="text-xs">
                                {cliente.activo ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="outline" size="sm" className="gap-1 h-8 px-2">
                                  <Mail className="h-3.5 w-3.5" />
                                  <span className="hidden lg:inline text-xs">Contactar</span>
                                </Button>
                                <Button variant="outline" size="sm" className="gap-1 h-8 px-2">
                                  <Phone className="h-3.5 w-3.5" />
                                  <span className="hidden lg:inline text-xs">Llamar</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Card */}
      {stats.totalRisk > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones de Acción</CardTitle>
            <CardDescription>Estrategias para retener clientes en riesgo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Contacto Inmediato</h4>
                  <p className="text-sm text-gray-600">
                    Priorizar llamadas telefónicas con clientes de riesgo alto para entender sus preocupaciones.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Oferta Personalizada</h4>
                  <p className="text-sm text-gray-600">
                    Diseñar incentivos o mejoras de servicio específicas para cada segmento en riesgo.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Seguimiento Continuo</h4>
                  <p className="text-sm text-gray-600">
                    Establecer un programa de seguimiento semanal para monitorear cambios en satisfacción.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ClientHealth;
