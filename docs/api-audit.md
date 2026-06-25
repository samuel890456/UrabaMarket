## Auditoría rápida API ↔ Frontend (UrabaMarket)

Fecha: 2026-04-22

### Endpoints existentes en backend (por módulo)

Base: `API_PREFIX` (default `/api/v1`)

- **Auth**
  - `POST /auth/register`
  - `POST /auth/login`

- **Usuarios**
  - `GET /usuarios/me`
  - `PATCH /usuarios/me`
  - `GET /usuarios` (Admin)
  - `GET /usuarios/:idUsuario` (Admin)
  - `PATCH /usuarios/:idUsuario` (Admin)

- **Categorías**
  - `GET /categorias`
  - `GET /categorias/todas` (Admin)
  - `GET /categorias/:idCategoria`
  - `POST /categorias` (Admin)
  - `PATCH /categorias/:idCategoria` (Admin)

- **Direcciones**
  - `GET /direcciones`
  - `POST /direcciones`
  - `PATCH /direcciones/:idDireccion`
  - `DELETE /direcciones/:idDireccion`

- **Tiendas**
  - `GET /tiendas` (público)
  - `GET /tiendas/mine` (Vendedor)
  - `POST /tiendas` (Vendedor)
  - `PATCH /tiendas/:idTienda` (Vendedor)
  - `GET /tiendas/:idTienda` (público)
  - `PATCH /tiendas/:idTienda/admin` (Admin)

- **Productos**
  - `GET /productos` (búsqueda)
  - `GET /productos/tienda/:idTienda`
  - `GET /productos/mios` (Vendedor)
  - `GET /productos/:idProducto` (`?visita=true` incrementa visitas)
  - `POST /productos` (Vendedor)
  - `PATCH /productos/:idProducto` (Vendedor)
  - `DELETE /productos/:idProducto` (Vendedor, baja lógica)

- **Carrito**
  - `GET /carrito`
  - `POST /carrito/items`
  - `PATCH /carrito/items/:idProducto`
  - `DELETE /carrito/items/:idProducto`
  - `DELETE /carrito/vaciar` ✅ (agregado)

- **Pedidos**
  - `POST /pedidos/checkout` (Cliente)
  - `GET /pedidos` (Cliente)
  - `GET /pedidos/tienda` (Vendedor)
  - `GET /pedidos/:idPedido` (Cliente / Vendedor afectado / Admin)
  - `PATCH /pedidos/:idPedido/estado` (Admin)

- **Compras a proveedor (B2B)**
  - `POST /compras-proveedor` (Vendedor)
  - `GET /compras-proveedor/mi-tienda` (Vendedor)
  - `GET /compras-proveedor/mi-proveedor` (Proveedor)
  - `GET /compras-proveedor/:idCompra` (roles)
  - `PATCH /compras-proveedor/:idCompra/estado` (roles)

- **Reseñas**
  - `GET /resenas?idProducto=...`
  - `POST /resenas`

- **Admin**
  - `GET /admin/estadisticas`
  - `GET /admin/tiendas`
  - `GET /admin/productos`

- **Health**
  - `GET /health`

---

### Consumo actual en frontend (servicios)

Archivos: `frontend/src/services/api/*.js`

✅ Consumidos (ya conectados):
- `POST /auth/login`, `POST /auth/register`
- `GET /categorias`
- `GET /tiendas`, `GET /tiendas/:id`
- `GET /productos`, `GET /productos/:id`, `GET /productos/tienda/:idTienda`
- `GET/PATCH /usuarios/me`
- `GET/POST /direcciones`
- `GET /carrito`, `POST /carrito/items`, `PATCH /carrito/items/:idProducto`, `DELETE /carrito/items/:idProducto`
- `POST /pedidos/checkout`, `GET /pedidos`, `GET /pedidos/:id`
- `GET /pedidos/tienda`
- `GET /productos/mios`
- `GET /admin/estadisticas`, `GET /usuarios`, `GET /admin/tiendas`, `GET /admin/productos`
- `GET /compras-proveedor/mi-proveedor`, `PATCH /compras-proveedor/:id/estado`

⚠️ Existen en backend pero no se consumen aún (o parcialmente):
- **Direcciones**: `PATCH /direcciones/:id`, `DELETE /direcciones/:id` (UI cliente solo crea/lista)
- **Categorías admin**: `/categorias/todas`, `POST/PATCH` (no hay pantallas admin completas aún)
- **Tiendas admin**: `PATCH /tiendas/:id/admin` (moderación)
- **Compras-proveedor**: flujo vendedor (`POST /compras-proveedor`, `GET /mi-tienda`, `GET /:id`) no tiene UI completa
- **Reseñas**: `GET/POST /resenas` no tiene UI integrada en producto
- **Pedidos admin**: `PATCH /pedidos/:id/estado` (moderación)

---

### Gaps detectados (requieren BD / endpoints nuevos)

Según las prioridades que pediste:

- **Promociones** (Vendedor/Admin): no hay tabla ni endpoints en el SQL actual → requiere diseño de BD + API + UI.
- **Múltiples imágenes por producto**: hoy solo existe `producto.imagenPrincipal`.
  - Para galería/carrusel profesional: tabla `producto_imagen` (1:N) o `jsonb` con URLs + endpoints para subir/listar/ordenar.
- **Proveedor: publicaciones/ofertas**: el esquema actual modela compras B2B (`CompraProveedor`) pero no “catálogo mayorista” ni “ofertas”.
  - Requiere tablas: `publicacion_proveedor` / `oferta_proveedor` o similar.

### Nota (estado actual del proyecto)

- **Carrito**: ya soporta agregar/actualizar/eliminar, vaciar (`DELETE /carrito/vaciar`), subtotal/total y validación de stock en backend.
- **Vendedor**: frontend ya permite crear/editar/eliminar producto, ajustar stock y ver pedidos/ventas.  
  Pendiente por BD: promociones y galería de imágenes (multi).
- **Proveedor**: frontend ya permite ver solicitudes B2B, actualizar estado y ver detalle.  
  Pendiente por BD: publicaciones/ofertas y catálogo mayorista con imágenes.
- **Pagos**: no hay integración pasarela (se maneja estado del pedido).

---

### Acciones en curso / próximas

1) Carrito completo (UI/UX + vaciar + totales + validación stock) ✅ en progreso
2) Vendedor (CRUD más completo, pedidos recibidos, ventas) → siguiente
3) Proveedor (gestión solicitudes + historial) → siguiente
4) Conectar endpoints faltantes (direcciones edit/delete, reseñas, compras-proveedor vendedor, moderación) → iterativo

