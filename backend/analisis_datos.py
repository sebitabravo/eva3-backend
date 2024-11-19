import pandas as pd

# Leer CSV
df = pd.read_csv('clientes_banco.csv')

# Limpieza: eliminar duplicados y manejar valores nulos
df = df.drop_duplicates()
df = df.dropna(subset=['Activo'])
df = df.dropna(subset=['Saldo'])

# Llenar valores vacios con la mediana y moda
df['Edad'] = df['Edad'].fillna(df['Edad'].median())
df['Genero'] = df['Genero'].fillna(df['Genero'].mode()[0])
df['Nivel_de_Satisfaccion'] = df['Nivel_de_Satisfaccion'].fillna(
    df['Nivel_de_Satisfaccion'].median())

# convirtiendo edad y satisfaccion de float a int
df['Edad'] = df['Edad'].astype(int)
df['Nivel_de_Satisfaccion'] = df['Nivel_de_Satisfaccion'].astype(int)

# Verificar valores nulos
print(df.isnull().sum())

# Exportar datos limpios
df.to_csv('clientes_limpios.csv', index=False)
