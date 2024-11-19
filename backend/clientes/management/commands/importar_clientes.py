import pandas as pd
from django.core.management.base import BaseCommand
from clientes.models import Cliente  # Importar el modelo Cliente


class Command(BaseCommand):
    help = 'Importa datos desde un archivo CSV a la tabla Cliente'

    def add_arguments(self, parser):
        # Agregar el argumento para el archivo CSV
        parser.add_argument('csvfile', type=str,
                            help='Ruta al archivo CSV de clientes')

    def handle(self, *args, **kwargs):
        # Obtener la ruta del archivo CSV de los argumentos
        csv_file = kwargs['csvfile']

        try:
            # Leer el archivo CSV con pandas
            df = pd.read_csv(csv_file)
        except FileNotFoundError:
            self.stderr.write(f"El archivo {csv_file} no fue encontrado.")
            return
        except Exception as e:
            self.stderr.write(f"Error al leer el archivo CSV: {e}")
            return

        # Iterar sobre cada fila del DataFrame
        for _, row in df.iterrows():
            try:
                # Crear una nueva instancia del modelo Cliente y guardarla
                Cliente.objects.create(
                    cliente_id=row['Cliente_ID'],
                    edad=int(row['Edad']),  # Convertir a entero
                    genero=row['Genero'],
                    saldo=float(row['Saldo']),  # Convertir a flotante
                    activo=bool(row['Activo']),  # Convertir de 1/0 a booleano
                    nivel_de_satisfaccion=int(
                        row['Nivel_de_Satisfaccion'])  # Convertir a entero
                )
            except Exception as e:
                # En caso de error, imprimir la fila que causó el error
                self.stderr.write(
                    f"Error al procesar la fila {row.to_dict()}: {e}")

        self.stdout.write(self.style.SUCCESS("Datos importados correctamente"))
