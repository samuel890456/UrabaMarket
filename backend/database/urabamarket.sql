-- ==========================================================
-- URABÁMARKET: VERSIÓN POSTGRESQL (NIVEL ARQUITECTO SENIOR)
-- ==========================================================
-- CREATE DATABASE urabamarket;
-- Conectarse a la base urabamarket antes de ejecutar el resto del script.

-- 1. TIPOS ENUM (PostgreSQL requiere crear los tipos explícitamente)
CREATE TYPE tipo_rol AS ENUM ('Cliente', 'Vendedor', 'Proveedor', 'Administrador');
CREATE TYPE tipo_estado_carrito AS ENUM ('Activo', 'Comprado', 'Abandonado');
CREATE TYPE tipo_estado_pedido AS ENUM ('Pendiente', 'Pagado', 'En Proceso', 'Completado', 'Cancelado');
CREATE TYPE tipo_metodo_pago AS ENUM ('Tarjeta', 'Transferencia', 'Efectivo', 'PSE');
CREATE TYPE tipo_estado_compra AS ENUM ('Pendiente', 'Recibido', 'Cancelado');

-- 2. CATEGORÍAS
CREATE TABLE Categoria (
    idCategoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. USUARIOS
CREATE TABLE Usuario (
    idUsuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol tipo_rol NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. DIRECCIONES
CREATE TABLE Direccion (
    idDireccion SERIAL PRIMARY KEY,
    idUsuario INT,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) DEFAULT 'Apartadó',
    esPrincipal BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_direccion FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario) ON DELETE CASCADE
);

-- 5. TIENDAS
CREATE TABLE Tienda (
    idTienda SERIAL PRIMARY KEY,
    idUsuario INT UNIQUE,
    idCategoria INT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_tienda FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
    CONSTRAINT fk_categoria_tienda FOREIGN KEY (idCategoria) REFERENCES Categoria(idCategoria) ON DELETE SET NULL
);

-- 6. PRODUCTOS
CREATE TABLE Producto (
    idProducto SERIAL PRIMARY KEY,
    idTienda INT,
    idCategoria INT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(12, 2) NOT NULL CHECK (precio >= 0),
    stock INT DEFAULT 0 CHECK (stock >= 0),
    visitas INT DEFAULT 0,
    imagenPrincipal VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tienda_producto FOREIGN KEY (idTienda) REFERENCES Tienda(idTienda) ON DELETE CASCADE,
    CONSTRAINT fk_categoria_producto FOREIGN KEY (idCategoria) REFERENCES Categoria(idCategoria) ON DELETE SET NULL
);

-- 7. CARRITOS
CREATE TABLE Carrito (
    idCarrito SERIAL PRIMARY KEY,
    idUsuario INT,
    estado tipo_estado_carrito DEFAULT 'Activo',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_carrito FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario) ON DELETE CASCADE
);

CREATE TABLE ItemCarrito (
    idItem SERIAL PRIMARY KEY,
    idCarrito INT,
    idProducto INT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precioFijado DECIMAL(12, 2) NOT NULL,
    CONSTRAINT unique_item_carrito UNIQUE(idCarrito, idProducto),
    CONSTRAINT fk_carrito_item FOREIGN KEY (idCarrito) REFERENCES Carrito(idCarrito) ON DELETE CASCADE,
    CONSTRAINT fk_producto_item FOREIGN KEY (idProducto) REFERENCES Producto(idProducto) ON DELETE CASCADE
);

-- 8. PEDIDOS
CREATE TABLE Pedido (
    idPedido SERIAL PRIMARY KEY,
    idUsuario INT,
    idDireccionEnvio INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado tipo_estado_pedido DEFAULT 'Pendiente',
    total DECIMAL(12, 2) DEFAULT 0 CHECK (total >= 0),
    CONSTRAINT fk_usuario_pedido FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario),
    CONSTRAINT fk_direccion_pedido FOREIGN KEY (idDireccionEnvio) REFERENCES Direccion(idDireccion)
);

-- 9. DETALLE DEL PEDIDO
CREATE TABLE DetallePedido (
    idDetalle SERIAL PRIMARY KEY,
    idPedido INT,
    idProducto INT,
    idTienda INT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precioUnitario DECIMAL(12, 2) NOT NULL CHECK (precioUnitario >= 0),
    CONSTRAINT fk_pedido_detalle FOREIGN KEY (idPedido) REFERENCES Pedido(idPedido) ON DELETE CASCADE,
    CONSTRAINT fk_producto_detalle FOREIGN KEY (idProducto) REFERENCES Producto(idProducto) ON DELETE RESTRICT,
    CONSTRAINT fk_tienda_detalle FOREIGN KEY (idTienda) REFERENCES Tienda(idTienda)
);

-- 10. COMPRAS A PROVEEDORES
CREATE TABLE CompraProveedor (
    idCompra SERIAL PRIMARY KEY,
    idTienda INT,
    idUsuarioProveedor INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(15, 2) DEFAULT 0 CHECK (total >= 0),
    estado tipo_estado_compra DEFAULT 'Pendiente',
    CONSTRAINT fk_tienda_compra FOREIGN KEY (idTienda) REFERENCES Tienda(idTienda),
    CONSTRAINT fk_proveedor_compra FOREIGN KEY (idUsuarioProveedor) REFERENCES Usuario(idUsuario)
);

CREATE TABLE DetalleCompraProveedor (
    idDetalleCompra SERIAL PRIMARY KEY,
    idCompra INT,
    idProductoVinculado INT NULL,
    nombreItem VARCHAR(150),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precioMayoreo DECIMAL(12, 2) NOT NULL CHECK (precioMayoreo >= 0),
    CONSTRAINT fk_compra_detalle_prov FOREIGN KEY (idCompra) REFERENCES CompraProveedor(idCompra) ON DELETE CASCADE,
    CONSTRAINT fk_prod_vinculado_prov FOREIGN KEY (idProductoVinculado) REFERENCES Producto(idProducto) ON DELETE SET NULL
);

-- 11. RESEÑAS
CREATE TABLE Reseña (
    idReseña SERIAL PRIMARY KEY,
    idUsuario INT,
    idProducto INT,
    puntuacion INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_reseña FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
    CONSTRAINT fk_producto_reseña FOREIGN KEY (idProducto) REFERENCES Producto(idProducto) ON DELETE CASCADE
);

-- 12. ÍNDICES
CREATE INDEX idx_producto_visitas ON Producto(visitas);
CREATE INDEX idx_item_carrito_id ON ItemCarrito(idCarrito);
CREATE INDEX idx_producto_tienda_id ON Producto(idTienda);
CREATE INDEX idx_producto_cat_id ON Producto(idCategoria);
CREATE INDEX idx_detalle_pedido_tienda ON DetallePedido(idTienda);
CREATE INDEX idx_pedido_usuario_id ON Pedido(idUsuario);
