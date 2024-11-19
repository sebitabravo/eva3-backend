# Funcionalidad Compandos

## Ejecutar Jumpyter
'''bash
jupyter notebook
'''

## Crear base de datos segun modelo
'''bash
python manage.py makemigrations
python manage.py migrate
'''

## Crear super usuario
'''bash
python manage.py createsuperuser
'''

## Importar csv a base de datos
'''bash
python3 manage.py importar_clientes clientes_limpios.csv
'''

## Inicar servidor
'''bash
python manage.py runserver
'''