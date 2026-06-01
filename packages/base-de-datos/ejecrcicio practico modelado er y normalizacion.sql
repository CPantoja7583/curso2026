-- Ejercicio Practico - Actividad Modelado ER y Normalizacion
-- DDL para tres sistemas:
-- 1. Envio de encomiendas
-- 2. Retail
-- 3. Cuentas bancarias

-- =========================================================
-- 1. Sistema de envio de encomiendas
-- =========================================================

CREATE TABLE cliente_envio (
  id_cliente INT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rut VARCHAR(20) UNIQUE NOT NULL,
  telefono VARCHAR(30),
  email VARCHAR(120) UNIQUE,
  direccion VARCHAR(150)
);

CREATE TABLE sucursal (
  id_sucursal INT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(150) NOT NULL,
  ciudad VARCHAR(80) NOT NULL,
  telefono VARCHAR(30)
);

CREATE TABLE tarifa (
  id_tarifa INT PRIMARY KEY,
  tipo_envio VARCHAR(50) NOT NULL,
  peso_max_kg NUMERIC(10,2) NOT NULL CHECK (peso_max_kg > 0),
  precio NUMERIC(12,2) NOT NULL CHECK (precio >= 0)
);

CREATE TABLE encomienda (
  id_encomienda INT PRIMARY KEY,
  id_cliente INT NOT NULL REFERENCES cliente_envio(id_cliente),
  id_sucursal_origen INT NOT NULL REFERENCES sucursal(id_sucursal),
  id_sucursal_destino INT NOT NULL REFERENCES sucursal(id_sucursal),
  id_tarifa INT NOT NULL REFERENCES tarifa(id_tarifa),
  fecha_envio DATE NOT NULL,
  peso_kg NUMERIC(10,2) NOT NULL CHECK (peso_kg > 0),
  descripcion VARCHAR(200),
  valor_declarado NUMERIC(12,2) NOT NULL CHECK (valor_declarado >= 0)
);

CREATE TABLE estado (
  id_estado INT PRIMARY KEY,
  nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE historial_estado (
  id_historial INT PRIMARY KEY,
  id_encomienda INT NOT NULL REFERENCES encomienda(id_encomienda),
  id_estado INT NOT NULL REFERENCES estado(id_estado),
  fecha_estado TIMESTAMP NOT NULL,
  comentario VARCHAR(200)
);

-- =========================================================
-- 2. Sistema de retail
-- =========================================================

CREATE TABLE cliente_retail (
  id_cliente INT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rut VARCHAR(20) UNIQUE NOT NULL,
  telefono VARCHAR(30),
  email VARCHAR(120) UNIQUE
);

CREATE TABLE categoria (
  id_categoria INT PRIMARY KEY,
  nombre_categoria VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE producto (
  id_producto INT PRIMARY KEY,
  id_categoria INT NOT NULL REFERENCES categoria(id_categoria),
  nombre VARCHAR(120) NOT NULL,
  descripcion VARCHAR(200),
  precio NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
  stock INT NOT NULL CHECK (stock >= 0)
);

CREATE TABLE pedido (
  id_pedido INT PRIMARY KEY,
  id_cliente INT NOT NULL REFERENCES cliente_retail(id_cliente),
  fecha_pedido DATE NOT NULL,
  estado_pedido VARCHAR(40) NOT NULL,
  total NUMERIC(12,2) NOT NULL CHECK (total >= 0)
);

CREATE TABLE detalle_pedido (
  id_pedido INT NOT NULL REFERENCES pedido(id_pedido),
  id_producto INT NOT NULL REFERENCES producto(id_producto),
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
  PRIMARY KEY (id_pedido, id_producto)
);

CREATE TABLE pago (
  id_pago INT PRIMARY KEY,
  id_pedido INT NOT NULL REFERENCES pedido(id_pedido),
  fecha_pago DATE NOT NULL,
  monto NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
  medio_pago VARCHAR(50) NOT NULL
);

-- =========================================================
-- 3. Sistema de cuentas bancarias
-- =========================================================

CREATE TABLE cliente_banco (
  id_cliente INT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rut VARCHAR(20) UNIQUE NOT NULL,
  telefono VARCHAR(30),
  email VARCHAR(120) UNIQUE
);

CREATE TABLE cuenta (
  id_cuenta INT PRIMARY KEY,
  id_cliente INT NOT NULL REFERENCES cliente_banco(id_cliente),
  numero_cuenta VARCHAR(30) NOT NULL UNIQUE,
  tipo_cuenta VARCHAR(40) NOT NULL,
  fecha_apertura DATE NOT NULL,
  saldo NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (saldo >= 0)
);

CREATE TABLE tipo_transaccion (
  id_tipo_transaccion INT PRIMARY KEY,
  nombre_tipo VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE transaccion (
  id_transaccion INT PRIMARY KEY,
  id_cuenta INT NOT NULL REFERENCES cuenta(id_cuenta),
  id_tipo_transaccion INT NOT NULL REFERENCES tipo_transaccion(id_tipo_transaccion),
  fecha_transaccion TIMESTAMP NOT NULL,
  monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
  descripcion VARCHAR(200)
);
