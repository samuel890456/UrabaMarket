-- Migration to add cost/profit columns

ALTER TABLE Producto
ADD COLUMN IF NOT EXISTS precioCosto DECIMAL(12,2) NULL;

ALTER TABLE DetallePedido
ADD COLUMN IF NOT EXISTS costoUnitario DECIMAL(12,2) NULL,
ADD COLUMN IF NOT EXISTS ganancia DECIMAL(12,2) NULL;
