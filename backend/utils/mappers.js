function mapDates(row, keys = ["createdat", "updatedat"]) {
  if (!row) return row;
  const o = { ...row };
  for (const k of keys) {
    if (o[k] != null) {
      const camel = k === "createdat" ? "createdAt" : k === "updatedat" ? "updatedAt" : k;
      o[camel] = o[k];
      if (camel !== k) delete o[k];
    }
  }
  return o;
}

export function mapUsuario(row, { includePassword = false } = {}) {
  if (!row) return null;
  const idUsuario = row.idusuario ?? row.idUsuario;
  const base = {
    idUsuario,
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono,
    rol: row.rol,
    activo: row.activo,
    createdAt: row.createdat ?? row.createdAt,
    updatedAt: row.updatedat ?? row.updatedAt
  };
  if (includePassword) base.password = row.password;
  return base;
}

export function mapCategoria(row) {
  if (!row) return null;
  return {
    idCategoria: row.idcategoria ?? row.idCategoria,
    nombre: row.nombre,
    descripcion: row.descripcion,
    activo: row.activo,
    createdAt: row.createdat ?? row.createdAt,
    updatedAt: row.updatedat ?? row.updatedAt
  };
}

export function mapDireccion(row) {
  if (!row) return null;
  return {
    idDireccion: row.iddireccion ?? row.idDireccion,
    idUsuario: row.idusuario ?? row.idUsuario,
    direccion: row.direccion,
    ciudad: row.ciudad,
    esPrincipal: row.esprincipal ?? row.esPrincipal,
    createdAt: row.createdat ?? row.createdAt,
    updatedAt: row.updatedat ?? row.updatedAt
  };
}

export function mapTienda(row) {
  if (!row) return null;
  return {
    idTienda: row.idtienda ?? row.idTienda,
    idUsuario: row.idusuario ?? row.idUsuario,
    idCategoria: row.idcategoria ?? row.idCategoria,
    nombre: row.nombre,
    descripcion: row.descripcion,
    activo: row.activo,
    createdAt: row.createdat ?? row.createdAt,
    updatedAt: row.updatedat ?? row.updatedAt
  };
}

export function mapProducto(row) {
  if (!row) return null;
  return {
    idProducto: row.idproducto ?? row.idProducto,
    idTienda: row.idtienda ?? row.idTienda,
    idCategoria: row.idcategoria ?? row.idCategoria,
    nombre: row.nombre,
    descripcion: row.descripcion,
    precio: row.precio != null ? Number(row.precio) : null,
    stock: row.stock,
    visitas: row.visitas,
    imagenPrincipal: row.imagenprincipal ?? row.imagenPrincipal,
    activo: row.activo,
    createdAt: row.createdat ?? row.createdAt,
    updatedAt: row.updatedat ?? row.updatedAt
  };
}

export function mapCarrito(row) {
  if (!row) return null;
  return {
    idCarrito: row.idcarrito ?? row.idCarrito,
    idUsuario: row.idusuario ?? row.idUsuario,
    estado: row.estado,
    createdAt: row.createdat ?? row.createdAt,
    updatedAt: row.updatedat ?? row.updatedAt
  };
}

export function mapItemCarrito(row) {
  if (!row) return null;
  return {
    idItem: row.iditem ?? row.idItem,
    idCarrito: row.idcarrito ?? row.idCarrito,
    idProducto: row.idproducto ?? row.idProducto,
    cantidad: row.cantidad,
    precioFijado: row.preciofijado != null ? Number(row.preciofijado) : null
  };
}

export function mapPedido(row) {
  if (!row) return null;
  return {
    idPedido: row.idpedido ?? row.idPedido,
    idUsuario: row.idusuario ?? row.idUsuario,
    idDireccionEnvio: row.iddireccionenvio ?? row.idDireccionEnvio,
    fecha: row.fecha,
    estado: row.estado,
    total: row.total != null ? Number(row.total) : null
  };
}

export function mapDetallePedido(row) {
  if (!row) return null;
  return {
    idDetalle: row.iddetalle ?? row.idDetalle,
    idPedido: row.idpedido ?? row.idPedido,
    idProducto: row.idproducto ?? row.idProducto,
    idTienda: row.idtienda ?? row.idTienda,
    cantidad: row.cantidad,
    precioUnitario: row.preciounitario != null ? Number(row.preciounitario) : null
  };
}

export function mapCompraProveedor(row) {
  if (!row) return null;
  return {
    idCompra: row.idcompra ?? row.idCompra,
    idTienda: row.idtienda ?? row.idTienda,
    idUsuarioProveedor: row.idusuarioproveedor ?? row.idUsuarioProveedor,
    fecha: row.fecha,
    total: row.total != null ? Number(row.total) : null,
    estado: row.estado
  };
}

export function mapDetalleCompraProveedor(row) {
  if (!row) return null;
  return {
    idDetalleCompra: row.iddetallecompra ?? row.idDetalleCompra,
    idCompra: row.idcompra ?? row.idCompra,
    idProductoVinculado: row.idproductovinculado ?? row.idProductoVinculado,
    nombreItem: row.nombreitem ?? row.nombreItem,
    cantidad: row.cantidad,
    precioMayoreo: row.preciomayoreo != null ? Number(row.preciomayoreo) : null
  };
}

export function mapResena(row) {
  if (!row) return null;
  const id = row.idreseña ?? row.idReseña ?? row.idresena;
  return {
    idResena: id,
    idUsuario: row.idusuario ?? row.idUsuario,
    idProducto: row.idproducto ?? row.idProducto,
    puntuacion: row.puntuacion,
    comentario: row.comentario,
    createdAt: row.createdat ?? row.createdAt
  };
}

export { mapDates };
