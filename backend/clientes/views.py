from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.db.models import Count, Avg, Sum, Q, Max, Min
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
from .models import Cliente
from .serializers import ClienteSerializer
from .throttling import BurstRateThrottle, ReadOnlyRateThrottle, WriteRateThrottle, StatsRateThrottle
from .pagination import ClientePagination
from .permissions import IsOwnerOrAdmin, IsAdminOrReadOnly, CanCreateCliente


# Create your views here.

@login_required
def cliente_list(request):
    clientes = Cliente.objects.all()
    return render(request, 'clientes/cliente_list.html', {'clientes': clientes})


@extend_schema_view(
    list=extend_schema(
        summary="Listar clientes (público)",
        description="Obtiene la lista completa de clientes. Acceso público con rate limiting (30/hora).",
        parameters=[
            OpenApiParameter(name='genero', type=str, description='Filtrar por género (M/F)'),
            OpenApiParameter(name='activo', type=bool, description='Filtrar por estado activo'),
            OpenApiParameter(name='nivel_de_satisfaccion', type=int, description='Filtrar por nivel de satisfacción (1-5)'),
            OpenApiParameter(name='page', type=int, description='Número de página'),
            OpenApiParameter(name='page_size', type=int, description='Tamaño de página (máx 100)'),
        ],
    ),
    retrieve=extend_schema(
        summary="Detalle de cliente (público)",
        description="Obtiene los detalles completos de un cliente específico. Acceso público.",
    ),
    create=extend_schema(
        summary="Crear cliente (solo admin)",
        description="Crea un nuevo cliente en el sistema. Requiere autenticación de administrador.",
    ),
    update=extend_schema(
        summary="Actualizar cliente (solo admin)",
        description="Actualiza todos los campos de un cliente existente. Requiere autenticación de administrador.",
    ),
    partial_update=extend_schema(
        summary="Actualizar parcialmente cliente (solo admin)",
        description="Actualiza uno o más campos de un cliente existente. Requiere autenticación de administrador.",
    ),
    destroy=extend_schema(
        summary="Eliminar cliente (solo admin)",
        description="Elimina un cliente del sistema. Requiere autenticación de administrador.",
    ),
)
class ClienteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD de clientes.
    
    Permisos:
    - Lectura (GET): PÚBLICO (sin autenticación, rate limit: 30/hora)
    - Escritura (POST/PUT/DELETE): SOLO ADMINISTRADORES
    
    Rate Limiting:
    - Anónimos: 30 requests/hora
    - Autenticados: 500 requests/hora
    - Admin escritura: 10 requests/hora
    - Estadísticas: 5 requests/hora
    
    Filtros disponibles:
    - genero: M (Masculino) o F (Femenino)
    - activo: true/false
    - nivel_de_satisfaccion: 1-5
    """
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['genero', 'activo', 'nivel_de_satisfaccion']
    pagination_class = ClientePagination
    permission_classes = [IsAdminOrReadOnly]  # GET público, POST/PUT/DELETE admin only
    throttle_classes = [BurstRateThrottle, ReadOnlyRateThrottle, WriteRateThrottle]

    def get_queryset(self):
        """
        Retorna todos los clientes para lectura pública.
        Admin puede ver todos.
        """
        return Cliente.objects.all()
    
    def perform_create(self, serializer):
        """Auto-asignar usuario admin al crear cliente"""
        serializer.save(usuario=self.request.user)
    
    @extend_schema(
        summary="Estadísticas de cliente",
        description="""
        Obtiene estadísticas detalladas de un cliente específico.
        
        Incluye:
        - Datos básicos del cliente
        - Nivel de satisfacción
        - Ranking del cliente
        - Comparación con promedio del sistema
        """,
        responses={
            200: OpenApiResponse(
                description="Estadísticas del cliente",
                response={
                    'type': 'object',
                    'properties': {
                        'cliente_id': {'type': 'integer'},
                        'edad': {'type': 'integer'},
                        'genero': {'type': 'string'},
                        'saldo': {'type': 'number'},
                        'activo': {'type': 'boolean'},
                        'nivel_de_satisfaccion': {'type': 'integer'},
                        'nivel_satisfaccion_texto': {'type': 'string'},
                        'ranking_saldo': {'type': 'string'},
                        'comparacion_promedio': {'type': 'object'},
                    }
                }
            ),
            404: OpenApiResponse(description="Cliente no encontrado"),
        }
    )
    @action(
        detail=True, 
        methods=['get'],
        throttle_classes=[StatsRateThrottle],
        url_path='estadisticas'
    )
    def estadisticas(self, request, pk=None):
        """Estadísticas detalladas de un cliente específico"""
        cliente = self.get_object()
        
        niveles_satisfaccion = {
            1: 'Muy Insatisfecho',
            2: 'Insatisfecho',
            3: 'Neutral',
            4: 'Satisfecho',
            5: 'Muy Satisfecho'
        }
        
        # Calcular ranking de saldo
        clientes_con_mayor_saldo = Cliente.objects.filter(saldo__gt=cliente.saldo).count()
        total_clientes = Cliente.objects.count()
        percentil = round((1 - (clientes_con_mayor_saldo / total_clientes)) * 100, 1) if total_clientes > 0 else 0
        
        # Comparación con promedio del sistema
        promedios = Cliente.objects.aggregate(
            promedio_edad=Avg('edad'),
            promedio_saldo=Avg('saldo')
        )
        
        data = {
            'cliente_id': cliente.cliente_id,
            'edad': cliente.edad,
            'genero': cliente.get_genero_display(),
            'saldo': float(cliente.saldo),
            'activo': cliente.activo,
            'nivel_de_satisfaccion': cliente.nivel_de_satisfaccion,
            'nivel_satisfaccion_texto': niveles_satisfaccion.get(cliente.nivel_de_satisfaccion, 'Desconocido'),
            'ranking_saldo': f'Top {percentil}%',
            'comparacion_promedio': {
                'edad': {
                    'cliente': cliente.edad,
                    'promedio': round(float(promedios['promedio_edad'] or 0), 1),
                    'diferencia': round(cliente.edad - float(promedios['promedio_edad'] or 0), 1)
                },
                'saldo': {
                    'cliente': float(cliente.saldo),
                    'promedio': round(float(promedios['promedio_saldo'] or 0), 2),
                    'diferencia': round(float(cliente.saldo) - float(promedios['promedio_saldo'] or 0), 2)
                }
            }
        }
        
        return Response(data)
    
    @extend_schema(
        summary="Estadísticas generales",
        description="""
        Obtiene estadísticas generales del sistema de clientes.
        
        Incluye:
        - Total de clientes y distribuciones
        - Top 5 clientes por saldo
        - Top 5 rangos de edad más comunes
        - Análisis de satisfacción por género
        - Tendencias y promedios
        - Métricas de saldo (min, max, promedio, total)
        """,
        responses={
            200: OpenApiResponse(
                description="Estadísticas generales del sistema",
            ),
        }
    )
    @action(
        detail=False, 
        methods=['get'],
        throttle_classes=[StatsRateThrottle],
        url_path='estadisticas-generales'
    )
    def estadisticas_generales(self, request):
        """Estadísticas generales del sistema con análisis avanzado"""
        queryset = self.get_queryset()
        
        # Básicas
        total = queryset.count()
        activos = queryset.filter(activo=True).count()
        inactivos = queryset.filter(activo=False).count()
        
        # Distribución por género
        por_genero = {
            'masculino': queryset.filter(genero='M').count(),
            'femenino': queryset.filter(genero='F').count(),
        }
        
        # Distribución por nivel de satisfacción
        por_satisfaccion = {}
        niveles = {
            1: 'muy_insatisfecho',
            2: 'insatisfecho',
            3: 'neutral',
            4: 'satisfecho',
            5: 'muy_satisfecho'
        }
        for nivel, nombre in niveles.items():
            por_satisfaccion[nombre] = queryset.filter(nivel_de_satisfaccion=nivel).count()
        
        # Promedios y agregaciones
        agregados = queryset.aggregate(
            promedio_edad=Avg('edad'),
            promedio_saldo=Avg('saldo'),
            saldo_total=Sum('saldo'),
            saldo_max=Max('saldo'),
            saldo_min=Min('saldo'),
            edad_max=Max('edad'),
            edad_min=Min('edad'),
        )
        
        # TOP 5 clientes por saldo
        top_5_saldo = list(queryset.order_by('-saldo')[:5].values(
            'cliente_id', 'edad', 'genero', 'saldo', 'nivel_de_satisfaccion'
        ))
        
        # Análisis de satisfacción por género
        satisfaccion_por_genero = {
            'masculino': {
                'promedio': queryset.filter(genero='M').aggregate(
                    avg=Avg('nivel_de_satisfaccion'))['avg'] or 0,
                'total': queryset.filter(genero='M').count()
            },
            'femenino': {
                'promedio': queryset.filter(genero='F').aggregate(
                    avg=Avg('nivel_de_satisfaccion'))['avg'] or 0,
                'total': queryset.filter(genero='F').count()
            }
        }
        
        # Distribución por rangos de edad
        rangos_edad = {
            '18-30': queryset.filter(edad__gte=18, edad__lte=30).count(),
            '31-45': queryset.filter(edad__gte=31, edad__lte=45).count(),
            '46-60': queryset.filter(edad__gte=46, edad__lte=60).count(),
            '61-80': queryset.filter(edad__gte=61, edad__lte=80).count(),
            '81+': queryset.filter(edad__gte=81).count(),
        }
        
        # Clientes con saldo alto (top 10%)
        if total > 0:
            threshold_top_10 = queryset.order_by('-saldo')[int(total * 0.1) if int(total * 0.1) > 0 else 0].saldo if total > 10 else 0
            clientes_saldo_alto = queryset.filter(saldo__gte=threshold_top_10).count()
        else:
            clientes_saldo_alto = 0
        
        # Tasa de satisfacción (4-5 considerados satisfechos)
        clientes_satisfechos = queryset.filter(nivel_de_satisfaccion__gte=4).count()
        tasa_satisfaccion = round((clientes_satisfechos / total * 100) if total > 0 else 0, 2)
        
        data = {
            # Totales
            'total_clientes': total,
            'clientes_activos': activos,
            'clientes_inactivos': inactivos,
            'porcentaje_activos': round((activos / total * 100) if total > 0 else 0, 2),
            
            # Distribuciones
            'por_genero': por_genero,
            'por_satisfaccion': por_satisfaccion,
            'por_rango_edad': rangos_edad,
            
            # Promedios
            'promedio_edad': round(float(agregados['promedio_edad'] or 0), 2),
            'promedio_saldo': round(float(agregados['promedio_saldo'] or 0), 2),
            
            # Saldos
            'saldo_total': round(float(agregados['saldo_total'] or 0), 2),
            'saldo_maximo': round(float(agregados['saldo_max'] or 0), 2),
            'saldo_minimo': round(float(agregados['saldo_min'] or 0), 2),
            
            # Edades
            'edad_maxima': agregados['edad_max'],
            'edad_minima': agregados['edad_min'],
            
            # Top 5
            'top_5_clientes_por_saldo': top_5_saldo,
            
            # Análisis avanzado
            'satisfaccion_por_genero': {
                'masculino': {
                    'promedio': round(float(satisfaccion_por_genero['masculino']['promedio']), 2),
                    'total_clientes': satisfaccion_por_genero['masculino']['total']
                },
                'femenino': {
                    'promedio': round(float(satisfaccion_por_genero['femenino']['promedio']), 2),
                    'total_clientes': satisfaccion_por_genero['femenino']['total']
                }
            },
            
            # Métricas de negocio
            'tasa_satisfaccion_general': tasa_satisfaccion,
            'clientes_alta_rentabilidad': clientes_saldo_alto,
            'porcentaje_alta_rentabilidad': round((clientes_saldo_alto / total * 100) if total > 0 else 0, 2),
        }
        
        return Response(data)
