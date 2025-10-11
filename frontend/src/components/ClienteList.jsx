import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  DollarSign, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function ClienteList({ token, clientesCache, fetchClientes, onUpdate }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [formData, setFormData] = useState({
    edad: '',
    genero: 'M',
    saldo: '',
    activo: true,
    nivel_de_satisfaccion: 3
  });
  const { toast } = useToast();

  useEffect(() => {
    if (clientesCache) {
      setClientes(clientesCache);
      setLoading(false);
      setError(null);
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
        setError(null);
      }
    } catch (err) {
      console.error('Error loading clientes:', err);
      setError('Error al cargar los clientes: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCliente = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/clientes/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setShowModal(false);
      resetForm();
      // Invalidar caché y recargar
      if (onUpdate) onUpdate();
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido creado exitosamente",
      });
    } catch (err) {
      console.error('Error creando cliente:', err);
      toast({
        title: "Error",
        description: 'Error al crear cliente: ' + (err.response?.data?.detail || err.message),
        variant: "destructive",
      });
    }
  };

  const handleUpdateCliente = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/clientes/${editingCliente.cliente_id}/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setShowModal(false);
      setEditingCliente(null);
      resetForm();
      // Invalidar caché y recargar
      if (onUpdate) onUpdate();
      toast({
        title: "Cliente actualizado",
        description: "El cliente ha sido actualizado exitosamente",
      });
    } catch (err) {
      console.error('Error actualizando cliente:', err);
      toast({
        title: "Error",
        description: 'Error al actualizar cliente: ' + (err.response?.data?.detail || err.message),
        variant: "destructive",
      });
    }
  };

  const handleDeleteCliente = async (clienteId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/clientes/${clienteId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Invalidar caché y recargar
      if (onUpdate) onUpdate();
      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado exitosamente",
      });
    } catch (err) {
      console.error('Error eliminando cliente:', err);
      toast({
        title: "Error",
        description: 'Error al eliminar cliente: ' + (err.response?.data?.detail || err.message),
        variant: "destructive",
      });
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingCliente(null);
    setShowModal(true);
  };

  const openEditModal = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      edad: cliente.edad,
      genero: cliente.genero,
      saldo: cliente.saldo,
      activo: cliente.activo,
      nivel_de_satisfaccion: cliente.nivel_de_satisfaccion
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      edad: '',
      genero: 'M',
      saldo: '',
      activo: true,
      nivel_de_satisfaccion: 3
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCliente(null);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getGeneroDisplay = (genero) => {
    return genero === 'M' ? 'Masculino' : 'Femenino';
  };

  const getSatisfactionDisplay = (nivel) => {
    const niveles = {
      1: 'Muy Insatisfecho',
      2: 'Insatisfecho',
      3: 'Neutral',
      4: 'Satisfecho',
      5: 'Muy Satisfecho'
    };
    return niveles[nivel] || nivel;
  };

  const isAtRisk = (nivel) => {
    return nivel <= 2;
  };

  const getSatisfactionBadge = (nivel) => {
    const variants = {
      1: 'destructive',
      2: 'destructive',
      3: 'secondary',
      4: 'default',
      5: 'default'
    };
    return variants[nivel] || 'secondary';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Lista de Clientes
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Gestiona y visualiza toda la información de tus clientes
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 w-full sm:w-auto" size="sm">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Cargando clientes...</span>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800">{error}</p>
                <Button 
                  onClick={fetchClientes} 
                  variant="outline" 
                  size="sm"
                  className="mt-3"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Clientes
                </CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{clientes.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Clientes Activos
                </CardTitle>
                <User className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {clientes.filter(c => c.activo).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Saldo Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${clientes.reduce((sum, c) => sum + parseFloat(c.saldo || 0), 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          {clientes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-500">No hay clientes registrados</p>
                <Button onClick={openCreateModal} className="mt-4">
                  Crear primer cliente
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Clientes Registrados</CardTitle>
                <CardDescription className="text-sm">
                  Listado completo de todos los clientes del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {/* Mobile Card View */}
                <div className="block sm:hidden">
                  <div className="divide-y divide-gray-200">
                    {clientes.map((cliente) => (
                      <div
                        key={cliente.cliente_id}
                        className={`p-4 ${isAtRisk(cliente.nivel_de_satisfaccion) ? 'bg-red-50' : ''}`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {isAtRisk(cliente.nivel_de_satisfaccion) && (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-semibold text-lg">ID: {cliente.cliente_id}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(cliente)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCliente(cliente.cliente_id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Edad:</span>
                            <span className="ml-2 font-medium">{cliente.edad}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Género:</span>
                            <span className="ml-2 font-medium">{cliente.genero === 'M' ? 'Masculino' : 'Femenino'}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Saldo:</span>
                            <span className="ml-2 font-semibold text-green-600">${parseFloat(cliente.saldo).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Estado:</span>
                            <span className="ml-2">
                              <Badge variant={cliente.activo ? "default" : "secondary"} className="text-xs">
                                {cliente.activo ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Satisfacción:</span>
                            <span className="ml-2">
                              <Badge
                                variant={getSatisfactionBadge(cliente.nivel_de_satisfaccion)}
                                className="text-xs"
                              >
                                {getSatisfactionDisplay(cliente.nivel_de_satisfaccion)}
                              </Badge>
                            </span>
                          </div>
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
                            <TableHead className="whitespace-nowrap">Edad</TableHead>
                            <TableHead className="whitespace-nowrap">Género</TableHead>
                            <TableHead className="whitespace-nowrap">Saldo</TableHead>
                            <TableHead className="whitespace-nowrap hidden md:table-cell">Estado</TableHead>
                            <TableHead className="whitespace-nowrap">Satisfacción</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientes.map((cliente) => (
                            <TableRow
                              key={cliente.cliente_id}
                              className={isAtRisk(cliente.nivel_de_satisfaccion) ? 'bg-red-50' : ''}
                            >
                              <TableCell className="font-medium whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  {isAtRisk(cliente.nivel_de_satisfaccion) && (
                                    <AlertTriangle className="h-4 w-4 text-red-600" title="Cliente en riesgo" />
                                  )}
                                  <span className="text-sm">{cliente.cliente_id}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{cliente.edad}</TableCell>
                              <TableCell className="hidden sm:table-cell text-sm">{getGeneroDisplay(cliente.genero)}</TableCell>
                              <TableCell className="font-semibold whitespace-nowrap text-sm">
                                ${parseFloat(cliente.saldo).toFixed(2)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant={cliente.activo ? "default" : "secondary"} className="text-xs">
                                  {cliente.activo ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getSatisfactionBadge(cliente.nivel_de_satisfaccion)} className="text-xs whitespace-nowrap">
                                  <span className="hidden sm:inline">{getSatisfactionDisplay(cliente.nivel_de_satisfaccion)}</span>
                                  <span className="sm:hidden">{cliente.nivel_de_satisfaccion}/5</span>
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1 sm:gap-2">
                                  <Button
                                    onClick={() => openEditModal(cliente)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    title="Editar"
                                  >
                                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteCliente(cliente.cliente_id)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
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
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingCliente 
                ? 'Modifica los datos del cliente seleccionado'
                : 'Completa el formulario para crear un nuevo cliente'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={editingCliente ? handleUpdateCliente : handleCreateCliente}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edad">Edad *</Label>
                  <Input
                    id="edad"
                    name="edad"
                    type="number"
                    value={formData.edad}
                    onChange={handleInputChange}
                    min="18"
                    max="120"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genero">Género *</Label>
                  <Select
                    value={formData.genero}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, genero: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="saldo">Saldo *</Label>
                  <Input
                    id="saldo"
                    name="saldo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.saldo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivel_de_satisfaccion">Nivel de Satisfacción *</Label>
                  <Select
                    value={formData.nivel_de_satisfaccion.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, nivel_de_satisfaccion: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muy Insatisfecho</SelectItem>
                      <SelectItem value="2">2 - Insatisfecho</SelectItem>
                      <SelectItem value="3">3 - Neutral</SelectItem>
                      <SelectItem value="4">4 - Satisfecho</SelectItem>
                      <SelectItem value="5">5 - Muy Satisfecho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
                />
                <Label htmlFor="activo">Cliente Activo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCliente ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClienteList;
