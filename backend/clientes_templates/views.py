from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from clientes.models import Cliente

# Listar clientes


class ClienteListView(ListView):
    model = Cliente
    template_name = 'clientes_templates/cliente_list.html'

# Detalle de un cliente


class ClienteDetailView(DetailView):
    model = Cliente
    template_name = 'clientes_templates/cliente_detail.html'

# Crear cliente


class ClienteCreateView(CreateView):
    model = Cliente
    template_name = 'clientes_templates/cliente_form.html'
    fields = ['edad', 'genero', 'saldo', 'activo', 'nivel_de_satisfaccion']
    success_url = reverse_lazy('cliente_list')

# Actualizar cliente


class ClienteUpdateView(UpdateView):
    model = Cliente
    template_name = 'clientes_templates/cliente_form.html'
    fields = ['edad', 'genero', 'saldo', 'activo', 'nivel_de_satisfaccion']
    success_url = reverse_lazy('cliente_list')

# Eliminar cliente


class ClienteDeleteView(DeleteView):
    model = Cliente
    template_name = 'clientes_templates/cliente_confirm_delete.html'
    success_url = reverse_lazy('cliente_list')
