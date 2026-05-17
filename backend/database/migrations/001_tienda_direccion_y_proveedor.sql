-- Ejecutar en la BD urabamarket si ya fue creada con una versión anterior.
-- Agrega columna direccion en tienda y crea tabla proveedor.

ALTER TABLE tienda
  ADD COLUMN IF NOT EXISTS direccion VARCHAR(255);

CREATE TABLE IF NOT EXISTS proveedor (
  idproveedor SERIAL PRIMARY KEY,
  idusuario INT UNIQUE,
  nombreempresa VARCHAR(150) NOT NULL,
  productosquedistribuye TEXT,
  createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_proveedor FOREIGN KEY (idusuario) REFERENCES usuario(idusuario) ON DELETE CASCADE
);
