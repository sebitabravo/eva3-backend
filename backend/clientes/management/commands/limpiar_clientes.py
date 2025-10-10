from django.core.management.base import BaseCommand
from clientes.models import Cliente


class Command(BaseCommand):
    help = 'Elimina todos los clientes de la base de datos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirmar',
            action='store_true',
            help='Confirma que deseas eliminar todos los clientes',
        )

    def handle(self, *args, **kwargs):
        confirmar = kwargs.get('confirmar', False)

        if not confirmar:
            self.stdout.write(self.style.ERROR(
                '⚠️  ADVERTENCIA: Este comando eliminará TODOS los clientes'
            ))
            self.stdout.write(self.style.WARNING(
                'Para ejecutarlo, usa: python manage.py limpiar_clientes --confirmar'
            ))
            return

        # Contar clientes antes de eliminar
        count = Cliente.objects.count()

        if count == 0:
            self.stdout.write(self.style.WARNING(
                'ℹ️  No hay clientes para eliminar'
            ))
            return

        # Confirmar una vez más
        self.stdout.write(self.style.WARNING(
            f'Se eliminarán {count} clientes'
        ))

        # Eliminar todos los clientes
        Cliente.objects.all().delete()

        self.stdout.write(self.style.SUCCESS(
            f'✅ {count} clientes eliminados exitosamente'
        ))
