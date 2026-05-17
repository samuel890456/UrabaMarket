-- Migration 003: Add wholesale products and B2B enhancements

-- Add new ENUM values for tipo_estado_compra
-- Ensure 'Draft' is added if not already present.
-- Note: PostgreSQL doesn't allow direct reordering of enum values or inserting in between.
-- A proper migration involves creating a new enum type, updating table columns to use the new type, and then dropping the old type.
-- For simplicity and assuming this enum is not yet heavily used or requires specific ordering, we'll just add it.
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_estado_compra') THEN
        CREATE TYPE tipo_estado_compra AS ENUM ('Pendiente', 'Recibido', 'Cancelado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'tipo_estado_compra'::regtype AND enumlabel = 'Aceptado') THEN
        ALTER TYPE tipo_estado_compra ADD VALUE 'Aceptado';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'tipo_estado_compra'::regtype AND enumlabel = 'Rechazado') THEN
        ALTER TYPE tipo_estado_compra ADD VALUE 'Rechazado';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'tipo_estado_compra'::regtype AND enumlabel = 'Enviado') THEN
        ALTER TYPE tipo_estado_compra ADD VALUE 'Enviado';
    END IF;
END $$;


-- 1. Create ProductoMayorista table
CREATE TABLE IF NOT EXISTS ProductoMayorista (
    idProductoMayorista SERIAL PRIMARY KEY,
    idProveedor INT NOT NULL,
    idCategoria INT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precioMayorista DECIMAL(12, 2) NOT NULL CHECK (precioMayorista >= 0),
    stockMayorista INT DEFAULT 0 CHECK (stockMayorista >= 0),
    marca VARCHAR(100),
    ivaMayorista DECIMAL(5,2),
    fechaVencimiento DATE,
    imagenPrincipal VARCHAR(255),
    tipoProducto VARCHAR(30) DEFAULT 'General',
    lote VARCHAR(80),
    fechaFabricacion DATE,
    garantiaMeses INT CHECK (garantiaMeses IS NULL OR garantiaMeses >= 0),
    vidaUtilMeses INT CHECK (vidaUtilMeses IS NULL OR vidaUtilMeses >= 0),
    modelo VARCHAR(120),
    compatibilidad VARCHAR(255),
    numeroSerie VARCHAR(120),
    activo BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proveedor_prod_mayorista FOREIGN KEY (idProveedor) REFERENCES Proveedor(idProveedor) ON DELETE CASCADE,
    CONSTRAINT fk_categoria_prod_mayorista FOREIGN KEY (idCategoria) REFERENCES Categoria(idCategoria) ON DELETE SET NULL
);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productomayorista' AND column_name='imagenprincipal') THEN
        ALTER TABLE ProductoMayorista ADD COLUMN imagenPrincipal VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productomayorista' AND column_name='tipoproducto') THEN
        ALTER TABLE ProductoMayorista ADD COLUMN tipoProducto VARCHAR(30) DEFAULT 'General';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productomayorista' AND column_name='lote') THEN
        ALTER TABLE ProductoMayorista ADD COLUMN lote VARCHAR(80);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productomayorista' AND column_name='fechafabricacion') THEN
        ALTER TABLE ProductoMayorista ADD COLUMN fechaFabricacion DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productomayorista' AND column_name='garantiameses') THEN
        ALTER TABLE ProductoMayorista ADD COLUMN garantiaMeses INT CHECK (garantiaMeses IS NULL OR garantiaMeses >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productomayorista' AND column_name='vidautilmeses') THEN
        ALTER TABLE ProductoMayorista ADD COLUMN vidaUtilMeses INT CHECK (vidaUtilMeses IS NULL OR vidaUtilMeses >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productomayorista' AND column_name='modelo') THEN
        ALTER TABLE ProductoMayorista ADD COLUMN modelo VARCHAR(120);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productomayorista' AND column_name='compatibilidad') THEN
        ALTER TABLE ProductoMayorista ADD COLUMN compatibilidad VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='productomayorista' AND column_name='numeroserie') THEN
        ALTER TABLE ProductoMayorista ADD COLUMN numeroSerie VARCHAR(120);
    END IF;
END $$;

-- 2. Modify Producto table
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='producto' AND column_name='idproductomayorista') THEN
        ALTER TABLE Producto ADD COLUMN idProductoMayorista INT NULL;
        ALTER TABLE Producto ADD CONSTRAINT fk_prod_mayorista_prod FOREIGN KEY (idProductoMayorista) REFERENCES ProductoMayorista(idProductoMayorista) ON DELETE SET NULL;
    END IF;
END $$;


-- Add new columns for seller-specific pricing/promotions if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='producto' AND column_name='promociones') THEN
        ALTER TABLE Producto ADD COLUMN promociones VARCHAR(255) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='producto' AND column_name='descuento') THEN
        ALTER TABLE Producto ADD COLUMN descuento DECIMAL(5,2) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='producto' AND column_name='preciocosto') THEN
        ALTER TABLE Producto ADD COLUMN precioCosto DECIMAL(12,2) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='producto' AND column_name='marca') THEN
        ALTER TABLE Producto ADD COLUMN marca VARCHAR(100) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='producto' AND column_name='iva') THEN
        ALTER TABLE Producto ADD COLUMN iva DECIMAL(5,2) NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='producto' AND column_name='fechavencimiento') THEN
        ALTER TABLE Producto ADD COLUMN fechaVencimiento DATE NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='producto' AND column_name='idproveedor') THEN
        ALTER TABLE Producto ADD COLUMN idProveedor INT NULL;
        ALTER TABLE Producto ADD CONSTRAINT fk_proveedor_producto FOREIGN KEY (idProveedor) REFERENCES Proveedor(idProveedor) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='producto' AND column_name='stockminimo') THEN
        ALTER TABLE Producto ADD COLUMN stockMinimo INT DEFAULT 0 CHECK (stockMinimo >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='producto' AND column_name='vendidostotales') THEN
        ALTER TABLE Producto ADD COLUMN vendidosTotales INT DEFAULT 0 CHECK (vendidosTotales >= 0);
    END IF;
END $$;


-- 3. Modify DetalleCompraProveedor table
-- Drop old columns if they exist
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='detallecompraproveedor' AND column_name='nombreitem') THEN
        ALTER TABLE DetalleCompraProveedor DROP COLUMN nombreItem;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='detallecompraproveedor' AND column_name='idproductovinculado') THEN
        ALTER TABLE DetalleCompraProveedor DROP COLUMN idProductoVinculado;
    END IF;
END $$;


-- Add new column to link to ProductoMayorista if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='detallecompraproveedor' AND column_name='idproductomayorista') THEN
        ALTER TABLE DetalleCompraProveedor ADD COLUMN idProductoMayorista INT;
        ALTER TABLE DetalleCompraProveedor ADD CONSTRAINT fk_prod_mayorista_detalle_compra FOREIGN KEY (idProductoMayorista) REFERENCES ProductoMayorista(idProductoMayorista) ON DELETE RESTRICT;
    END IF;
END $$;
