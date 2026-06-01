-- Tarea 14
-- Ejercicio Práctico - n° 3
--
-- Supuesto de estructura:
-- actividad4(
--   id INT,
--   persona VARCHAR(100),
--   tipo VARCHAR(20),          -- 'DEBO' o 'ME_DEBEN'
--   monto_total DECIMAL(10,2),
--   cuotas INT
-- )
--
-- Si tu tabla usa otros nombres de columnas, solo cambia los alias.

-- 1. A quien(es) le debe mas dinero y cuanto.
SELECT persona, monto_total
FROM actividad4
WHERE tipo = 'DEBO'
  AND monto_total = (
    SELECT MAX(monto_total)
    FROM actividad4
    WHERE tipo = 'DEBO'
  );

-- 2. Quien(es) le debe mas dinero a usted y cuanto.
SELECT persona, monto_total
FROM actividad4
WHERE tipo = 'ME_DEBEN'
  AND monto_total = (
    SELECT MAX(monto_total)
    FROM actividad4
    WHERE tipo = 'ME_DEBEN'
  );

-- 3. Cuanto dinero debe en total.
SELECT SUM(monto_total) AS deuda_total
FROM actividad4
WHERE tipo = 'DEBO';

-- 4. Cuanto dinero debe en promedio.
SELECT AVG(monto_total) AS deuda_promedio
FROM actividad4
WHERE tipo = 'DEBO';

-- 5. Suponiendo que no puede pagar mas de una cuota al mes.
-- Respuesta estandar: sumar todas las cuotas pendientes de sus deudas.
SELECT SUM(cuotas) AS meses_para_saldar_deuda_estandar
FROM actividad4
WHERE tipo = 'DEBO';

-- Respuesta experta:
-- cuota mensual actual considerando todas las deudas vigentes.
SELECT SUM(monto_total / cuotas) AS cuota_mensual_actual
FROM actividad4
WHERE tipo = 'DEBO';

-- 6. Si cobra todo lo que le deben y usa ese dinero para bajar su deuda.
-- Nueva deuda reducida.
SELECT
  SUM(CASE WHEN tipo = 'DEBO' THEN monto_total ELSE 0 END) -
  SUM(CASE WHEN tipo = 'ME_DEBEN' THEN monto_total ELSE 0 END) AS nueva_deuda_reducida
FROM actividad4;

-- Cuanto tendria que pagar mensualmente para cubrir lo restante
-- manteniendo las cuotas ya acordadas.
WITH resumen AS (
  SELECT
    SUM(CASE WHEN tipo = 'DEBO' THEN monto_total ELSE 0 END) AS deuda_total,
    SUM(CASE WHEN tipo = 'ME_DEBEN' THEN monto_total ELSE 0 END) AS cobranza_total,
    SUM(CASE WHEN tipo = 'DEBO' THEN cuotas ELSE 0 END) AS cuotas_totales_deuda
  FROM actividad4
)
SELECT
  (deuda_total - cobranza_total) / cuotas_totales_deuda AS nueva_cuota_mensual_promedio
FROM resumen;

-- 7. Insertar nuevo registro: la pareja, 50 lucas.
-- Puedes ajustar las cuotas si el enunciado original define otro numero.
INSERT INTO actividad4 (id, persona, tipo, monto_total, cuotas)
VALUES (999, 'Pareja', 'DEBO', 50000, 1);

-- 8. Cuanto sera la cuota a pagar este mes con el nuevo registro.
SELECT SUM(monto_total / cuotas) AS cuota_a_pagar_este_mes
FROM actividad4
WHERE tipo = 'DEBO';

-- 9. Update: la señora del almacen acepta 13 cuotas.
-- Ajusta el nombre si en tu tabla aparece con otro texto.
UPDATE actividad4
SET cuotas = 13
WHERE persona = 'Señora del almacén'
   OR persona = 'Senora del almacen'
   OR persona = 'Almacen';

-- 10. Nueva cuota a pagar este mes luego del update.
SELECT SUM(monto_total / cuotas) AS cuota_a_pagar_este_mes_actualizada
FROM actividad4
WHERE tipo = 'DEBO';
