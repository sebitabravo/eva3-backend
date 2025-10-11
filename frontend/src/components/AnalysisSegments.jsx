import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const SATISFACTION_COLORS = {
  1: '#ef4444', // Rojo intenso
  2: '#f97316', // Naranja
  3: '#eab308', // Amarillo
  4: '#84cc16', // Lima
  5: '#22c55e'  // Verde
};

const SATISFACTION_LABELS = {
  1: 'Muy Insatisfecho',
  2: 'Insatisfecho',
  3: 'Neutral',
  4: 'Satisfecho',
  5: 'Muy Satisfecho'
};

function AnalysisSegments({ token, clientesCache, fetchClientes }) {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [ageRange, setAgeRange] = useState([18, 100]);
  const [genderFilter, setGenderFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (clientesCache) {
      setClientes(clientesCache);
      setLoading(false);
    } else if (token && fetchClientes) {
      loadData();
    }
  }, [clientesCache, token]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchClientes();
      if (data) {
        setClientes(data);
      }
    } catch (err) {
      console.error('Error loading clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [clientes, ageRange, genderFilter, activeFilter]);

  const applyFilters = () => {
    let filtered = clientes.filter(c => {
      const edad = parseInt(c.edad);
      const matchAge = edad >= ageRange[0] && edad <= ageRange[1];
      const matchGender = genderFilter === 'all' || c.genero === genderFilter;
      const matchActive = activeFilter === 'all' || 
        (activeFilter === 'active' && c.activo) || 
        (activeFilter === 'inactive' && !c.activo);
      
      return matchAge && matchGender && matchActive;
    });
    
    setFilteredClientes(filtered);
  };

  // Satisfaction vs Balance
  const getSatisfactionBalanceData = () => {
    const groupedData = {};
    
    filteredClientes.forEach(c => {
      const nivel = c.nivel_de_satisfaccion;
      if (!groupedData[nivel]) {
        groupedData[nivel] = { total: 0, count: 0 };
      }
      groupedData[nivel].total += parseFloat(c.saldo);
      groupedData[nivel].count += 1;
    });

    return Object.entries(groupedData).map(([nivel, data]) => ({
      name: SATISFACTION_LABELS[nivel],
      nivel: parseInt(nivel),
      saldoPromedio: data.total / data.count,
      clientes: data.count
    })).sort((a, b) => a.nivel - b.nivel);
  };

  // Age vs Balance scatter
  const getAgeBalanceData = () => {
    return filteredClientes.map(c => ({
      edad: parseInt(c.edad),
      saldo: parseFloat(c.saldo),
      satisfaccion: c.nivel_de_satisfaccion
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-lg">Cargando análisis...</div>
      </div>
    );
  }

  const satisfactionBalanceData = getSatisfactionBalanceData();
  const ageBalanceData = getAgeBalanceData();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Análisis por Segmentos</h2>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Análisis profundo y segmentado de clientes</p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">Filtros Interactivos</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Personaliza el análisis con filtros</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Age Range Filter */}
            <div className="space-y-2">
              <Label>Rango de Edad: {ageRange[0]} - {ageRange[1]} años</Label>
              <Slider
                min={18}
                max={100}
                step={1}
                value={ageRange}
                onValueChange={setAgeRange}
                className="mt-2"
              />
            </div>

            {/* Gender Filter */}
            <div className="space-y-2">
              <Label>Género</Label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filter */}
            <div className="space-y-2">
              <Label>Estado del Cliente</Label>
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600">
            Mostrando <strong>{filteredClientes.length}</strong> de <strong>{clientes.length}</strong> clientes
          </div>
        </CardContent>
      </Card>

      {/* Satisfaction vs Balance */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">Satisfacción vs Saldo Promedio</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Relación entre el nivel de satisfacción y el saldo promedio. Cada color representa un nivel.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-1 sm:px-6 pb-3 sm:pb-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={satisfactionBalanceData}
              margin={{ top: 10, right: 10, left: -10, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-20}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 9 }}
                interval={0}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#3b82f6"
                label={{ value: 'Saldo ($)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                tick={{ fontSize: 9 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#8b5cf6"
                label={{ value: 'Clientes', angle: 90, position: 'insideRight', style: { fontSize: 10 } }}
                tick={{ fontSize: 9 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value, name) => {
                  if (name === 'Saldo Promedio') return [`$${value.toFixed(2)}`, name];
                  if (name === 'Nº Clientes') return [value, name];
                  return value;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar 
                yAxisId="left" 
                dataKey="saldoPromedio" 
                name="Saldo Promedio"
                radius={[8, 8, 0, 0]}
              >
                {satisfactionBalanceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={SATISFACTION_COLORS[entry.nivel]}
                    stroke={SATISFACTION_COLORS[entry.nivel]}
                    strokeWidth={2}
                  />
                ))}
              </Bar>
              <Bar 
                yAxisId="right" 
                dataKey="clientes" 
                fill="#8b5cf6" 
                name="Nº Clientes"
                radius={[8, 8, 0, 0]}
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Legend explanation */}
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Interpretación:</p>
            <p className="text-xs text-gray-600">
              Las barras de <strong style={{ color: '#3b82f6' }}>colores</strong> muestran el saldo promedio por nivel de satisfacción.
              Las barras <strong style={{ color: '#8b5cf6' }}>moradas</strong> muestran cuántos clientes hay en cada nivel.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Age vs Balance Scatter */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">Análisis: Edad vs Saldo</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Cada punto representa un cliente. El color indica su nivel de satisfacción.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-1 sm:px-6 pb-3 sm:pb-6">
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                dataKey="edad"
                name="Edad"
                domain={['dataMin - 2', 'dataMax + 2']}
                label={{
                  value: 'Edad (años)',
                  position: 'insideBottom',
                  offset: -5,
                  style: { fontSize: 10, fontWeight: 'bold' }
                }}
                tick={{ fontSize: 9 }}
              />
              <YAxis
                type="number"
                dataKey="saldo"
                name="Saldo"
                label={{
                  value: 'Saldo ($)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 10, fontWeight: 'bold' }
                }}
                tick={{ fontSize: 9 }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                formatter={(value, name) => {
                  if (name === 'Saldo') return [`$${value.toFixed(2)}`, name];
                  if (name === 'Edad') return [`${value} años`, name];
                  return value;
                }}
                labelFormatter={(label) => `Cliente`}
              />
              <Scatter name="Clientes" data={ageBalanceData} fill="#3b82f6">
                {ageBalanceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={SATISFACTION_COLORS[entry.satisfaccion]}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    r={6}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          {/* Legend for satisfaction colors */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Leyenda de Colores:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: SATISFACTION_COLORS[1] }}
                ></div>
                <span className="text-xs font-medium">Muy Insat.</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: SATISFACTION_COLORS[2] }}
                ></div>
                <span className="text-xs font-medium">Insatisfecho</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: SATISFACTION_COLORS[3] }}
                ></div>
                <span className="text-xs font-medium">Neutral</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: SATISFACTION_COLORS[4] }}
                ></div>
                <span className="text-xs font-medium">Satisfecho</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: SATISFACTION_COLORS[5] }}
                ></div>
                <span className="text-xs font-medium">Muy Sat.</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 sm:mt-3">
              <strong>Cómo leer el gráfico:</strong> Cada punto representa un cliente.
              Si ves puntos rojos en la parte superior, son clientes insatisfechos con alto saldo (en riesgo de pérdida).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalysisSegments;
