import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, UserCheck } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const SATISFACTION_COLORS = {
  1: '#ef4444', // red
  2: '#f97316', // orange
  3: '#eab308', // yellow
  4: '#84cc16', // lime
  5: '#22c55e'  // green
};

function Dashboard({ token, clientesCache, fetchClientes }) {
  const [stats, setStats] = useState({
    totalClientes: 0,
    saldoPromedio: 0,
    edadPromedio: 0,
    clienteMaxSaldo: null
  });
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [satisfactionDistribution, setSatisfactionDistribution] = useState([]);
  const [genderDistribution, setGenderDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error loading data:', err);
      setLoading(false);
    }
  };

  const processData = (clientes) => {
    try {
      setLoading(true);
      
      // Calculate stats
      const totalClientes = clientes.length;
      const saldoPromedio = clientes.reduce((sum, c) => sum + parseFloat(c.saldo || 0), 0) / totalClientes || 0;
      const edadPromedio = clientes.reduce((sum, c) => sum + parseInt(c.edad || 0), 0) / totalClientes || 0;
      const clienteMaxSaldo = clientes.reduce((max, c) => 
        parseFloat(c.saldo) > parseFloat(max?.saldo || 0) ? c : max, clientes[0]);

      setStats({
        totalClientes,
        saldoPromedio: saldoPromedio.toFixed(2),
        edadPromedio: edadPromedio.toFixed(1),
        clienteMaxSaldo
      });

      // Age distribution (18-25, 26-35, 36-45, 46-55, 56+)
      const ageRanges = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56+': 0
      };
      
      clientes.forEach(c => {
        const edad = parseInt(c.edad);
        if (edad <= 25) ageRanges['18-25']++;
        else if (edad <= 35) ageRanges['26-35']++;
        else if (edad <= 45) ageRanges['36-45']++;
        else if (edad <= 55) ageRanges['46-55']++;
        else ageRanges['56+']++;
      });

      setAgeDistribution(
        Object.entries(ageRanges).map(([name, value]) => ({ name, value }))
      );

      // Satisfaction distribution
      const satisfactionLevels = {
        'Muy Insatisfecho': 0,
        'Insatisfecho': 0,
        'Neutral': 0,
        'Satisfecho': 0,
        'Muy Satisfecho': 0
      };
      
      clientes.forEach(c => {
        const nivel = c.nivel_de_satisfaccion;
        if (nivel === 1) satisfactionLevels['Muy Insatisfecho']++;
        else if (nivel === 2) satisfactionLevels['Insatisfecho']++;
        else if (nivel === 3) satisfactionLevels['Neutral']++;
        else if (nivel === 4) satisfactionLevels['Satisfecho']++;
        else if (nivel === 5) satisfactionLevels['Muy Satisfecho']++;
      });

      setSatisfactionDistribution(
        Object.entries(satisfactionLevels).map(([name, value]) => ({ name, value }))
      );

      // Gender distribution
      const genderCount = { 'Masculino': 0, 'Femenino': 0 };
      clientes.forEach(c => {
        if (c.genero === 'M') genderCount['Masculino']++;
        else genderCount['Femenino']++;
      });

      setGenderDistribution(
        Object.entries(genderCount).map(([name, value]) => ({ name, value }))
      );

    } catch (err) {
      console.error('Error processing dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-lg">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard General</h2>
        <p className="text-gray-500 mt-1">Visión general de la cartera de clientes</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-gray-500 mt-1">Clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Saldo Promedio
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.saldoPromedio}</div>
            <p className="text-xs text-gray-500 mt-1">Por cliente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Edad Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.edadPromedio}</div>
            <p className="text-xs text-gray-500 mt-1">Años</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Cliente Top
            </CardTitle>
            <UserCheck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.clienteMaxSaldo ? parseFloat(stats.clienteMaxSaldo.saldo).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ID: {stats.clienteMaxSaldo?.cliente_id || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Edad</CardTitle>
            <CardDescription>Agrupación de clientes por rangos de edad</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Clientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Satisfaction Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Satisfacción</CardTitle>
            <CardDescription>Nivel de satisfacción de los clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={satisfactionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {satisfactionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gender Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Género</CardTitle>
          <CardDescription>Proporción de clientes por género</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genderDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ec4899'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
