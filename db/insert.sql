-- Importar datos de un archivo CSV a una tabla MySQL
LOAD DATA INFILE '/ruta/a/tu/archivo/clientes.csv'
INTO TABLE clientes
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;