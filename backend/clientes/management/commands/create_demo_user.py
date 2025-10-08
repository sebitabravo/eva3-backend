"""
Comando para crear un usuario demo con permisos limitados de solo lectura.
Uso: python manage.py create_demo_user
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Permission
from django.contrib.contenttypes.models import ContentType
from clientes.models import Cliente


class Command(BaseCommand):
    help = 'Crea un usuario demo con permisos de solo lectura'

    def handle(self, *args, **kwargs):
        username = 'demo'
        password = 'demo2024'
        email = 'demo@example.com'

        # Eliminar usuario demo si ya existe
        if User.objects.filter(username=username).exists():
            User.objects.filter(username=username).delete()
            self.stdout.write(self.style.WARNING(f'Usuario "{username}" existente eliminado'))

        # Crear usuario demo
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=False,
            is_superuser=False
        )

        # Asignar SOLO permisos de lectura (view)
        content_type = ContentType.objects.get_for_model(Cliente)
        view_permission = Permission.objects.get(
            codename='view_cliente',
            content_type=content_type
        )
        user.user_permissions.add(view_permission)

        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('✓ Usuario demo creado exitosamente'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(f'  Usuario: {username}')
        self.stdout.write(f'  Contraseña: {password}')
        self.stdout.write(f'  Permisos: Solo lectura (view)')
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.WARNING(''))
        self.stdout.write(self.style.WARNING('IMPORTANTE:'))
        self.stdout.write(self.style.WARNING('- Este usuario NO puede crear, editar o eliminar'))
        self.stdout.write(self.style.WARNING('- Perfecto para demos públicas y portafolio'))
        self.stdout.write(self.style.WARNING('- El middleware DemoModeMiddleware proporciona protección adicional'))
        self.stdout.write(self.style.WARNING(''))
