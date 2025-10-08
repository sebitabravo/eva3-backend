"""
Middleware de protección para modo DEMO.
Permite solo operaciones de lectura (GET) y bloquea escrituras (POST, PUT, PATCH, DELETE).
"""

from django.http import JsonResponse
from django.conf import settings


class DemoModeMiddleware:
    """
    Middleware que protege el API en modo demo.
    - Permite: GET, OPTIONS, HEAD (solo lectura)
    - Permite: POST a /api/token/ (login necesario)
    - Bloquea: POST, PUT, PATCH, DELETE (escritura en recursos)
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    # Rutas que deben permitir POST incluso en modo demo
    ALLOWED_POST_PATHS = [
        '/api/token/',
        '/api/token/refresh/',
    ]
        
    def __call__(self, request):
        # Solo aplicar si DEMO_MODE está activado
        if settings.DEMO_MODE:
            # Métodos de escritura que queremos bloquear
            write_methods = ['POST', 'PUT', 'PATCH', 'DELETE']
            
            # Si es un método de escritura
            if request.method in write_methods:
                # Permitir rutas específicas (login)
                if request.path in self.ALLOWED_POST_PATHS:
                    return self.get_response(request)
                
                # Bloquear escrituras en el API
                if request.path.startswith('/api/'):
                    return JsonResponse({
                        'error': 'Operación no permitida',
                        'message': 'Este es un proyecto de demostración en modo solo lectura. Las operaciones de escritura están deshabilitadas para proteger el sistema.',
                        'demo_mode': True,
                        'method_attempted': request.method,
                        'hint': 'Puedes clonar el proyecto de GitHub y ejecutarlo localmente para probar todas las funcionalidades.'
                    }, status=403)
        
        response = self.get_response(request)
        return response
