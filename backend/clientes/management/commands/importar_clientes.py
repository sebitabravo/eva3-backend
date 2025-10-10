import pandas as pd
from decimal import Decimal, ROUND_HALF_UP
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from clientes.models import Cliente

User = get_user_model()


class Command(BaseCommand):
    help = 'Importa datos desde un archivo CSV a la tabla Cliente'

    def add_arguments(self, parser):
        parser.add_argument('csvfile', type=str,
                            help='Ruta al archivo CSV de clientes')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csvfile']

        try:
            df = pd.read_csv(csv_file)
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(
                f"❌ El archivo {csv_file} no fue encontrado."))
            return
        except Exception as e:
            self.stderr.write(self.style.ERROR(
                f"❌ Error al leer el archivo CSV: {e}"))
            return

        # Obtener o crear usuario admin para asignar clientes
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True
            }
        )

        self.stdout.write(f"📊 Procesando {len(df)} registros del CSV...")

        success_count = 0
        error_count = 0
        skip_count = 0

        for index, row in df.iterrows():
            try:
                # Convertir género de "Masculino"/"Femenino" a "M"/"F"
                genero_map = {
                    'Masculino': 'M',
                    'Femenino': 'F',
                    'M': 'M',
                    'F': 'F'
                }
                genero = genero_map.get(str(row['Genero']).strip(), 'M')

                # Convertir activo (1.0/0.0 o True/False)
                activo = bool(float(row['Activo']))

                # Verificar si el cliente ya existe
                cliente_id = int(row['Cliente_ID'])
                if Cliente.objects.filter(cliente_id=cliente_id).exists():
                    skip_count += 1
                    continue

                # Convertir saldo a Decimal con exactamente 2 decimales
                # Esto evita problemas de precisión de punto flotante
                saldo_raw = float(row['Saldo'])
                saldo_decimal = Decimal(str(saldo_raw)).quantize(
                    Decimal('0.01'),
                    rounding=ROUND_HALF_UP
                )

                # Crear cliente
                Cliente.objects.create(
                    cliente_id=cliente_id,
                    usuario=admin_user,
                    edad=int(row['Edad']),
                    genero=genero,
                    saldo=saldo_decimal,
                    activo=activo,
                    nivel_de_satisfaccion=int(row['Nivel_de_Satisfaccion'])
                )
                success_count += 1

                # Mostrar progreso cada 500 registros
                if (index + 1) % 500 == 0:
                    self.stdout.write(f"   Procesados: {index + 1}/{len(df)}")

            except Exception as e:
                error_count += 1
                self.stderr.write(self.style.WARNING(
                    f"⚠️  Error en fila {index + 1} (ID: {row.get('Cliente_ID', 'N/A')}): {e}"
                ))

        # Resumen
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("═" * 60))
        self.stdout.write(self.style.SUCCESS(
            f"✅ Importación completada"))
        self.stdout.write(self.style.SUCCESS(f"   Registros creados:  {success_count}"))
        if skip_count > 0:
            self.stdout.write(self.style.WARNING(
                f"   Registros omitidos: {skip_count} (ya existían)"))
        if error_count > 0:
            self.stdout.write(self.style.ERROR(
                f"   Registros con error: {error_count}"))
        self.stdout.write(self.style.SUCCESS("═" * 60))
