# Iniciar servidor
```bash
python manage.py runserver
```

# Documentacion de la aplicacion de clientes
Toda la documentacion esta en el apartado de 

- [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

# Funcionalidad Compandos

## Ejecutar Jumpyter
```bash
jupyter notebook
```

## Crear base de datos segun modelo
```bash
python manage.py makemigrations
python manage.py migrate
```

## Crear super usuario
```bash
python manage.py createsuperuser
```

## Importar csv a base de datos
```bash
python3 manage.py importar_clientes clientes_limpios.csv
```