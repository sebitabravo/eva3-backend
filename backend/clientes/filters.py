import django_filters
from .models import Cliente


class ClienteFilter(django_filters.FilterSet):
    edad = django_filters.NumberFilter(field_name='edad', lookup_expr='gte', label='Edad')
    genero = django_filters.ChoiceFilter(field_name='genero', choices=Cliente.GENERO_CHOICES, label='Género')
    activo = django_filters.BooleanFilter(field_name='activo', label='Activo')
    saldo = django_filters.NumberFilter(field_name='saldo', lookup_expr='gte', label='Saldo')

    class Meta:
        model = Cliente
        fields = ['edad', 'genero', 'activo', 'saldo']
