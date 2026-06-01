# Evaluacion final modulo 5

## Parte 2: modelo ER propuesto

### Entidades

**Actor**
- `id_actor` (PK)
- `nombre`

**Teleserie**
- `id_teleserie` (PK)
- `nombre`
- `cantidad_emisiones`
- `unidad_emision`

**Reparto**
- `id_reparto` (PK)
- `id_actor` (FK)
- `id_teleserie` (FK)
- `protagonico`
- `sueldo`

### Relaciones y cardinalidades

- Un `actor` puede participar en muchas `teleseries`.
- Una `teleserie` puede tener muchos `actores`.
- La relacion N:M se resuelve con `reparto`.
- `reparto` guarda los atributos propios de la participacion: `protagonico` y `sueldo`.

### Justificacion de normalizacion

- En las tablas originales, el nombre de la teleserie estaba implícito en el nombre de la tabla.
- Tambien se repetian `temporadas` o `capitulos` en todas las filas de cada reparto.
- En el modelo normalizado:
  - `actor` evita repetir nombres.
  - `teleserie` concentra los datos propios de cada produccion.
  - `reparto` concentra solo los datos de la participacion del actor en una teleserie.

### Consulta solicitada en la parte 2

Para listar todas las teleseries y todos los actores de reparto asociados, excluyendo roles secundarios, basta consultar `teleserie` con `reparto` y `actor`, filtrando `protagonico = true`.
