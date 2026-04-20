# UrabaMarket

Plataforma digital para la región de Urabá: clientes, tiendas (vendedores), proveedores y administración. Monorepo con **React (Vite)** + **Node.js (Express)** + **PostgreSQL**.

---

## Requisitos

- Node.js 18+
- PostgreSQL 14+ (base `urabamarket`, ver `backend/database/urabamarket.sql`)

---

## Puesta en marcha

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar DATABASE_URL, JWT_SECRET (mínimo 8 caracteres)
npm run dev
```

API base: `http://localhost:4000/api/v1`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api/v1
npm run dev
```

---

## Usuario administrador inicial (contraseña en texto plano)

El login del backend valida contraseñas con **bcrypt**. Si insertaste el administrador con `password` en **texto plano** (`admin123`), el inicio de sesión **fallará** hasta actualizar el hash.

1. Genera el hash:

```bash
cd backend
node scripts/hash-password.mjs admin123
```

2. Ejecuta en PostgreSQL (sustituye el hash por el que imprimió el script):

```sql
UPDATE usuario
SET password = '<hash_bcrypt_aqui>'
WHERE LOWER(email) = LOWER('admin@urabamarket.com');
```

> Nota: en PostgreSQL los identificadores sin comillas suelen quedar en minúsculas (`usuario`, no `Usuario`).

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena PostgreSQL |
| `PORT` | Puerto HTTP (default 4000) |
| `API_PREFIX` | Prefijo API (default `/api/v1`) |
| `JWT_SECRET` | Secreto firmado JWT |
| `JWT_EXPIRES_IN` | Expiración token (ej. `7d`) |
| `BCRYPT_ROUNDS` | Rondas bcrypt (ej. `10`) |

### Frontend (`frontend/.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL base del API (ej. `http://localhost:4000/api/v1`) |

---

## Documentación funcional vs backend

### Cobertura por rol

| Rol | Funcionalidad (SRS) | Backend actual | Observación |
|-----|---------------------|----------------|-------------|
| **Cliente** | Registro, login, perfil, direcciones, catálogo, carrito, checkout, pedidos | `auth`, `usuarios`, `direcciones`, `productos`, `tiendas`, `carrito`, `pedidos`, `resenas` | Cubierto. |
| **Vendedor** | Tienda propia, CRUD productos, inventario (stock), pedidos de su tienda | `tiendas`, `productos`, `pedidos/tienda`, `compras-proveedor` (compra a proveedor) | Cubierto. “Ventas” = pedidos que incluyen su tienda. |
| **Proveedor** | Anuncios B2B, contacto con tiendas | `compras-proveedor` (listados mi-proveedor, estado) | No hay tabla **anuncios** separada en el SQL actual; el flujo B2B va por **compras a proveedor**. |
| **Administrador** | Usuarios, tiendas, moderación, reportes | `usuarios`, `admin/estadisticas`, `admin/tiendas`, `admin/productos`, `pedidos` estado | Promociones / moderación avanzada no modelada en BD. |

### Endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | No | Salud + ping DB |
| POST | `/auth/register` | No | Registro |
| POST | `/auth/login` | No | Login (JWT) |
| GET/PATCH | `/usuarios/me` | Sí | Perfil |
| GET | `/usuarios` | Admin | Listado usuarios |
| GET | `/categorias` | No | Categorías activas |
| GET | `/categorias/todas` | Admin | Todas (paginado) |
| POST/PATCH | `/categorias`… | Admin | CRUD categorías |
| CRUD | `/direcciones`… | Sí | Direcciones del usuario |
| GET | `/tiendas` | No | Tiendas activas |
| GET | `/tiendas/mine` | Vendedor | Mi tienda |
| POST/PATCH | `/tiendas`… | Vendedor | Crear/editar tienda |
| GET | `/productos` | No | Búsqueda productos |
| GET | `/productos/tienda/:id` | No | Por tienda |
| GET | `/productos/:id` | No | Detalle (`?visita=true` suma visita) |
| POST/PATCH/DELETE | `/productos`… | Vendedor | CRUD productos |
| GET/POST/PATCH/DELETE | `/carrito`… | Sí | Carrito |
| POST | `/pedidos/checkout` | Cliente | Checkout |
| GET | `/pedidos` | Cliente | Mis pedidos |
| GET | `/pedidos/tienda` | Vendedor | Pedidos con mi tienda |
| GET | `/pedidos/:id` | Sí | Detalle (cliente, vendedor afectado o admin) |
| PATCH | `/pedidos/:id/estado` | Admin | Estado pedido |
| POST | `/compras-proveedor` | Vendedor | Pedido B2B a proveedor |
| GET | `/compras-proveedor/mi-tienda` | Vendedor | Compras de mi tienda |
| GET | `/compras-proveedor/mi-proveedor` | Proveedor | Compras donde soy proveedor |
| GET/PATCH | `/compras-proveedor/:id`… | Sí | Ver / estado |
| GET/POST | `/resenas`… | Mix | Reseñas por producto |
| GET | `/admin/estadisticas` | Admin | KPIs |
| GET | `/admin/tiendas` | Admin | Todas las tiendas |
| GET | `/admin/productos` | Admin | Todos los productos |
| GET | `/productos/mios` | Vendedor | Productos de mi tienda (activos e inactivos) |

### Funciones aún no cubiertas en BD / API

- **Promociones** y **cupones** (SRS): no hay tablas en el script SQL actual.
- **Pagos en línea** (Pasarela): no integrado; pedidos usan totales y estados.
- **Anuncios de proveedor** como entidad independiente: el esquema actual se centra en **CompraProveedor** + detalle.
- **Recuperación de contraseña** por email: no implementada.

---

## Scripts útiles

```bash
# Hash bcrypt para actualizar contraseña del admin en SQL
cd backend && node scripts/hash-password.mjs admin123
```

---

## Frontend: mapa de navegación sugerido

| Área | Rutas sugeridas | Prioridad |
|------|-----------------|-----------|
| Público | `/`, `/tiendas`, `/productos`, `/productos/:id`, `/login`, `/registro` | Alta |
| Cliente | `/cliente`, `/cliente/perfil`, `/cliente/direcciones`, `/cliente/carrito`, `/cliente/checkout`, `/cliente/pedidos` | Alta |
| Vendedor | `/vendedor`, `/vendedor/tienda`, `/vendedor/productos`, `/vendedor/ventas` | Alta |
| Proveedor | `/proveedor`, `/proveedor/compras-b2b` | Media |
| Admin | `/admin`, `/admin/usuarios`, `/admin/tiendas`, `/admin/productos`, `/admin/reportes` | Media |

El código en `frontend/src` implementa esta estructura con **rutas protegidas** y **layout por rol**.

---

## Arquitectura frontend (resumen)

```
frontend/src/
├── assets/
├── components/     # UI reutilizable (Button, Card, Navbar, Sidebar…)
├── hooks/
├── layouts/
├── pages/           # Por área: public, auth, cliente, vendedor, proveedor, admin
├── router/          # Rutas + guards
├── services/        # Llamadas API (axios)
├── store/           # Zustand (auth)
├── styles/
└── utils/
```

### Identidad visual (marca)

- Primario: `#16A34A`
- Secundario / oscuro: `#0F172A`
- Acento: `#F59E0B`
- Fondo: `#F8FAFC`
- Texto: `#111827`

---

## Licencia y créditos

Proyecto académico / UrabáMarket.
