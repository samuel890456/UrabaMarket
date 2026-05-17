import { pool } from "../config/database.js";

export const proveedorModel = {
  async findById(idProveedor, db = pool) {
    const { rows } = await db.query(`SELECT * FROM proveedor WHERE idproveedor = $1`, [idProveedor]);
    return rows[0] ?? null;
  },

  async findByUsuario(idUsuario, db = pool) {
    const { rows } = await db.query(`SELECT * FROM proveedor WHERE idusuario = $1`, [idUsuario]);
    return rows[0] ?? null;
  },

  async create({ idUsuario, nombreEmpresa, productosQueDistribuye }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO proveedor (idusuario, nombreempresa, productosquedistribuye)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [idUsuario, nombreEmpresa, productosQueDistribuye]
    );
    return rows[0];
  },

  async listAll(db = pool) {
    const { rows } = await db.query(
      `SELECT
          p.*,
          u.nombre AS nombre_usuario,
          u.email
       FROM proveedor p
       INNER JOIN usuario u ON p.idusuario = u.idusuario
       WHERE u.activo = TRUE
       ORDER BY p.nombreempresa ASC`
    );
    return rows;
  }

  // Add update and other methods as needed in the future
};
