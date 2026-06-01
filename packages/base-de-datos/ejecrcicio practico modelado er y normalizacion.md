# Ejercicio Practico - Actividad Modelado ER y Normalizacion

## 1. Sistema de envio de encomiendas

### Entidades y atributos

**Cliente**
- `id_cliente` (PK)
- `nombre`
- `rut`
- `telefono`
- `email`
- `direccion`

**Sucursal**
- `id_sucursal` (PK)
- `nombre`
- `direccion`
- `ciudad`
- `telefono`

**Tarifa**
- `id_tarifa` (PK)
- `tipo_envio`
- `peso_max_kg`
- `precio`

**Encomienda**
- `id_encomienda` (PK)
- `id_cliente` (FK)
- `id_sucursal_origen` (FK)
- `id_sucursal_destino` (FK)
- `id_tarifa` (FK)
- `fecha_envio`
- `peso_kg`
- `descripcion`
- `valor_declarado`

**Estado**
- `id_estado` (PK)
- `nombre_estado`

**Historial_estado**
- `id_historial` (PK)
- `id_encomienda` (FK)
- `id_estado` (FK)
- `fecha_estado`
- `comentario`

### Relaciones y cardinalidades

- Cliente 1:N Encomienda
- Sucursal 1:N Encomienda como origen
- Sucursal 1:N Encomienda como destino
- Tarifa 1:N Encomienda
- Encomienda 1:N Historial_estado
- Estado 1:N Historial_estado

### Normalizacion

- 1FN: atributos atomicos y sin grupos repetidos.
- 2FN: el historial de estados se separa para no repetir estados en la tabla encomienda.
- 3FN: tarifa y estado se separan como catálogos para evitar dependencias transitivas.

## 2. Sistema de venta de productos de retail

### Entidades y atributos

**Cliente**
- `id_cliente` (PK)
- `nombre`
- `rut`
- `telefono`
- `email`

**Categoria**
- `id_categoria` (PK)
- `nombre_categoria`

**Producto**
- `id_producto` (PK)
- `id_categoria` (FK)
- `nombre`
- `descripcion`
- `precio`
- `stock`

**Pedido**
- `id_pedido` (PK)
- `id_cliente` (FK)
- `fecha_pedido`
- `estado_pedido`
- `total`

**Detalle_pedido**
- `id_pedido` (PK, FK)
- `id_producto` (PK, FK)
- `cantidad`
- `precio_unitario`

**Pago**
- `id_pago` (PK)
- `id_pedido` (FK)
- `fecha_pago`
- `monto`
- `medio_pago`

### Relaciones y cardinalidades

- Cliente 1:N Pedido
- Categoria 1:N Producto
- Pedido N:M Producto, resuelta con Detalle_pedido
- Pedido 1:N Pago

### Normalizacion

- 1FN: productos y pedidos sin listas incrustadas.
- 2FN: detalle_pedido separa la relación N:M.
- 3FN: categoria y pago se separan para evitar datos duplicados o derivados en pedido/producto.

## 3. Sistema administrador de cuentas bancarias

### Entidades y atributos

**Cliente**
- `id_cliente` (PK)
- `nombre`
- `rut`
- `telefono`
- `email`

**Cuenta**
- `id_cuenta` (PK)
- `id_cliente` (FK)
- `numero_cuenta` (UNIQUE)
- `tipo_cuenta`
- `fecha_apertura`
- `saldo`

**Tipo_transaccion**
- `id_tipo_transaccion` (PK)
- `nombre_tipo`

**Transaccion**
- `id_transaccion` (PK)
- `id_cuenta` (FK)
- `id_tipo_transaccion` (FK)
- `fecha_transaccion`
- `monto`
- `descripcion`

### Relaciones y cardinalidades

- Cliente 1:N Cuenta
- Cuenta 1:N Transaccion
- Tipo_transaccion 1:N Transaccion

### Normalizacion

- 1FN: movimientos atomicos por transaccion.
- 2FN: no hay dependencias parciales al usar claves simples.
- 3FN: tipo_transaccion se separa como catálogo para evitar repetición textual en cada movimiento.

## Resumen de decisiones de diseño

- Se usaron catálogos para datos repetitivos: `estado`, `tarifa`, `categoria`, `tipo_transaccion`.
- Las relaciones N:M se resolvieron con tablas intermedias, como `detalle_pedido`.
- Se mantuvieron montos y saldos con tipos numéricos y restricciones de no negatividad cuando corresponde.
