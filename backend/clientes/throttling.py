"""
Custom throttling classes para protección avanzada contra abuso
"""
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class BurstRateThrottle(UserRateThrottle):
    """Prevención de ráfagas de peticiones"""
    scope = 'burst'


class ReadOnlyRateThrottle(UserRateThrottle):
    """Throttling para operaciones de lectura (GET)"""
    scope = 'read'
    
    def allow_request(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return super().allow_request(request, view)
        return True


class WriteRateThrottle(UserRateThrottle):
    """Throttling más restrictivo para operaciones de escritura"""
    scope = 'write'
    
    def allow_request(self, request, view):
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return super().allow_request(request, view)
        return True


class StatsRateThrottle(UserRateThrottle):
    """Throttling para endpoints de estadísticas (operaciones costosas)"""
    scope = 'stats'
