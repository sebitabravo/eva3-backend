CREATE DATABASE IF NOT EXISTS banco_clientes;

USE banco_clientes;

CREATE TABLE IF NOT EXISTS clientes (
    Cliente_ID INT AUTO_INCREMENT PRIMARY KEY,
    Edad INT NOT NULL,                          
    Genero ENUM('Masculino', 'Femenino') NOT NULL, 
    Saldo DECIMAL(10, 2) NOT NULL,              
    Activo TINYINT(1) NOT NULL,                 
    Nivel_de_Satisfaccion INT NOT NULL CHECK (Nivel_de_Satisfaccion BETWEEN 1 AND 5)
);

CREATE INDEX idx_cliente_id ON clientes(Cliente_ID);