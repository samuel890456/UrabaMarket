-- Keeps Pedido.idPedido globally unique and autoincremental after manual imports/seeds.
-- SERIAL already provides a single global sequence; this realigns it with existing rows.
SELECT setval(
  pg_get_serial_sequence('pedido', 'idpedido'),
  COALESCE((SELECT MAX(idpedido) FROM pedido), 0) + 1,
  false
);
