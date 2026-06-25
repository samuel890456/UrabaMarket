# Arquitectura de inventario de UrabaMarket

## Modelo recomendado

UrabaMarket debe usar inventario perpetuo por movimientos, con una bitacora tipo Kardex liviana.

Este modelo encaja mejor que inventario periodico porque el marketplace necesita validar stock en tiempo real durante checkout, abastecimiento B2B y recepcion de compras de proveedor.

## Reglas aplicadas

- El vendedor no edita el stock final manualmente desde productos.
- El stock aumenta por entradas de inventario y compras B2B recibidas.
- El stock disminuye por ventas/pedidos confirmados en checkout.
- Cada movimiento registra producto, tienda, tipo, cantidad, stock anterior, stock nuevo, referencia y costo unitario cuando aplica.
- Las compras B2B abiertas se bloquean por tienda/proveedor para evitar duplicados simultaneos.

## Modelo de costo

La implementacion actual usa costo unitario registrado en el movimiento y precio de costo del producto para KPIs.

Para una fase posterior:

- Promedio ponderado es el siguiente paso natural para UrabaMarket.
- FIFO conviene si se manejan lotes, vencimientos o perecederos.
- LIFO no se recomienda para este caso.

## Stock profesional esperado

- Stock fisico: unidades reales en tienda.
- Stock comprometido: unidades reservadas por pedidos pendientes de pago/preparacion.
- Stock disponible: stock fisico menos stock comprometido.

La base actual registra movimientos y descuenta en checkout. La siguiente mejora seria agregar reservas explicitas para carritos o pedidos en estado pendiente si el negocio lo requiere.
