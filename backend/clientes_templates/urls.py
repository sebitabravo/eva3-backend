from django.urls import path
from . import views

urlpatterns = [
    path('', views.ClienteListView.as_view(),
         name='cliente_list'),  # Listar clientes
    path('<int:pk>/', views.ClienteDetailView.as_view(),
         name='cliente_detail'),  # Detalle de cliente
    path('create/', views.ClienteCreateView.as_view(),
         name='cliente_create'),  # Crear cliente
    path('<int:pk>/update/', views.ClienteUpdateView.as_view(),
         name='cliente_update'),  # Actualizar cliente
    path('<int:pk>/delete/', views.ClienteDeleteView.as_view(),
         name='cliente_delete'),  # Eliminar cliente
]
