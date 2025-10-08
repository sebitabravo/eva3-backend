"""
Custom permissions para control de acceso granular
"""
from rest_framework import permissions
from django.conf import settings


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Sistema de permisos flexible:
    
    LECTURA (GET/HEAD/OPTIONS):
    - ✅ Permitido para TODOS (público, sin autenticación)
    
    ESCRITURA (POST/PUT/PATCH/DELETE):
    - ✅ Administradores autenticados
    - ✅ Frontend del contenedor (con o sin autenticación)
    - ✅ Usuarios autenticados desde frontend del contenedor
    
    El frontend del contenedor tiene privilegios especiales y puede realizar
    todas las operaciones sin restricciones, incluso sin ser admin.
    """
    
    def has_permission(self, request, view):
        # Lectura permitida para todos (incluso sin autenticación)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Verificar si la petición viene del frontend del contenedor (CORS origin)
        origin = request.META.get('HTTP_ORIGIN', '')
        allowed_origins = getattr(settings, 'FRONTEND_CONTAINER_ORIGINS', [])
        
        # Si viene del frontend del contenedor, permitir todas las operaciones
        # Este es el caso especial: frontend del contenedor = acceso completo
        if origin in allowed_origins:
            return True
        
        # Escritura para administradores autenticados (acceso tradicional)
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permiso personalizado: Solo el propietario del recurso o admin puede editarlo
    """
    
    def has_object_permission(self, request, view, obj):
        # Los métodos de lectura se permiten para todos
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Staff/admin puede hacer todo
        if request.user and request.user.is_staff:
            return True
        
        # El propietario puede editar/eliminar su propio recurso
        if hasattr(obj, 'usuario') and request.user.is_authenticated:
            return obj.usuario == request.user
        
        return False


class CanCreateCliente(permissions.BasePermission):
    """
    Permiso personalizado: Solo admin puede crear clientes
    """
    
    def has_permission(self, request, view):
        # Lectura permitida para todos
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Solo admin puede crear
        if request.method == 'POST':
            return request.user and request.user.is_authenticated and request.user.is_staff
        
        return True
    
    message = 'Solo administradores pueden crear clientes'
