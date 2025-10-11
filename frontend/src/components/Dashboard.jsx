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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard General</h2>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Visión general de la cartera de clientes</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Total de Clientes
            </CardTitle>
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.totalClientes}</div>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">Clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Saldo Promedio
            </CardTitle>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">${stats.saldoPromedio}</div>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">Por cliente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Edad Promedio
            </CardTitle>
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.edadPromedio}</div>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">Años</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Cliente Top
            </CardTitle>
            <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">
              ${stats.clienteMaxSaldo ? parseFloat(stats.clienteMaxSaldo.saldo).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="hidden sm:inline">ID: </span>{stats.clienteMaxSaldo?.cliente_id || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Age Distribution */}
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-base sm:text-lg">Distribución por Edad</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Agrupación de clientes por rangos de edad</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ageDistribution} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="value" fill="#3b82f6" name="Clientes" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Satisfaction Distribution */}
        <Card>
          <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-base sm:text-lg">Distribución de Satisfacción</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Nivel de satisfacción de los clientes</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={satisfactionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    const shortName = name.replace('Muy ', '').replace('Insatisfecho', 'Insat.');
                    return `${shortName}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontSize: '10px' }}
                >
                  {satisfactionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gender Distribution */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">Distribución por Género</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Proporción de clientes por género</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
                style={{ fontSize: '11px' }}
              >
                {genderDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ec4899'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
