CREATE TABLE IF NOT EXISTS MovimientoInventario (
  idMovimiento SERIAL PRIMARY KEY,
  idProducto INT NOT NULL,
  idTienda INT NOT NULL,
  tipo VARCHAR(40) NOT NULL,
  cantidad INT NOT NULL,
  stockAnterior INT NOT NULL DEFAULT 0,
  stockNuevo INT NOT NULL DEFAULT 0,
  referenciaTipo VARCHAR(60),
  referenciaId INT,
  costoUnitario DECIMAL(12,2),
  nota TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mov_inv_producto FOREIGN KEY (idProducto) REFERENCES Producto(idProducto) ON DELETE CASCADE,
  CONSTRAINT fk_mov_inv_tienda FOREIGN KEY (idTienda) REFERENCES Tienda(idTienda) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mov_inv_producto_fecha ON MovimientoInventario(idProducto, createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_mov_inv_tienda_fecha ON MovimientoInventario(idTienda, createdAt DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_compra_proveedor_abierta
ON CompraProveedor(idTienda, idUsuarioProveedor)
WHERE estado IN ('Pendiente', 'Aceptado', 'Enviado');
