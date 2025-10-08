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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Salud del Cliente</h2>
        <p className="text-gray-500 mt-1">Identificación y seguimiento de clientes en riesgo</p>
      </div>

      {/* Risk Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clientes en Riesgo
            </CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.totalRisk}</div>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.totalRisk / clientes.length) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Riesgo Alto
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{stats.highRisk}</div>
            <p className="text-xs text-gray-500 mt-1">Muy insatisfechos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Riesgo Medio
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.mediumRisk}</div>
            <p className="text-xs text-gray-500 mt-1">Insatisfechos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Valor en Riesgo
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">${stats.totalValue}</div>
            <p className="text-xs text-gray-500 mt-1">Saldo total en riesgo</p>
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Clientes en Riesgo</CardTitle>
              <CardDescription>
                Lista de clientes con satisfacción muy baja que requieren atención
              </CardDescription>
            </div>
            <Button onClick={fetchClientes} variant="outline" size="sm" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nivel de Riesgo</TableHead>
                  <TableHead>Satisfacción</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Género</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskClientes.map((cliente) => (
                  <TableRow 
                    key={cliente.cliente_id}
                    className={getRiskLevel(cliente.nivel_de_satisfaccion) === 'high' ? 'bg-red-50' : 'bg-orange-50'}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getRiskLevel(cliente.nivel_de_satisfaccion) === 'high' && (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        {cliente.cliente_id}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRiskBadge(cliente.nivel_de_satisfaccion)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white">
                        {getSatisfactionText(cliente.nivel_de_satisfaccion)}
                      </Badge>
                    </TableCell>
                    <TableCell>{cliente.edad} años</TableCell>
                    <TableCell>{cliente.genero === 'M' ? 'Masculino' : 'Femenino'}</TableCell>
                    <TableCell className="font-semibold">
                      ${parseFloat(cliente.saldo).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cliente.activo ? "default" : "secondary"}>
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Mail className="h-3 w-3" />
                          Contactar
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Phone className="h-3 w-3" />
                          Llamar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
