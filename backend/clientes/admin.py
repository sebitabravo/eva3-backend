from django.contrib import admin
from .models import Cliente

# Register your models here.


class ClienteAdmin(admin.ModelAdmin):
    list_display = ('cliente_id', 'edad', 'genero', 'saldo',
                    'activo', 'nivel_de_satisfaccion', 'usuario')
    list_filter = ('genero', 'activo', 'nivel_de_satisfaccion')
    search_fields = ('cliente_id', 'edad')
    readonly_fields = ('cliente_id',)


admin.site.register(Cliente, ClienteAdmin)
