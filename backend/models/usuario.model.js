import { pool } from "../config/database.js";

export const usuarioModel = {
  async findByEmail(email, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM usuario WHERE LOWER(email) = LOWER($1)`,
      [email]
    );
    return rows[0] ?? null;
  },

  async findById(idUsuario, db = pool) {
    const { rows } = await db.query(`SELECT * FROM usuario WHERE idusuario = $1`, [idUsuario]);
    return rows[0] ?? null;
  },

  async count(whereRol = null, db = pool) {
    if (whereRol) {
      const { rows } = await db.query(
        `SELECT COUNT(*)::int AS n FROM usuario WHERE rol = $1::tipo_rol`,
        [whereRol]
      );
      return rows[0]?.n ?? 0;
    }
    const { rows } = await db.query(`SELECT COUNT(*)::int AS n FROM usuario`);
    return rows[0]?.n ?? 0;
  },

  async list({ limit, offset, rol = null }, db = pool) {
    if (rol) {
      const { rows } = await db.query(
        `SELECT idusuario, nombre, email, telefono, rol, activo, createdat, updatedat
         FROM usuario WHERE rol = $1::tipo_rol
         ORDER BY idusuario DESC LIMIT $2 OFFSET $3`,
        [rol, limit, offset]
      );
      return rows;
    }
    const { rows } = await db.query(
      `SELECT idusuario, nombre, email, telefono, rol, activo, createdat, updatedat
       FROM usuario ORDER BY idusuario DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return rows;
  },

  async create({ nombre, email, password, telefono, rol }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO usuario (nombre, email, password, telefono, rol)
       VALUES ($1, $2, $3, $4, $5::tipo_rol)
       RETURNING idusuario, nombre, email, telefono, rol, activo, createdat, updatedat`,
      [nombre, email, password, telefono ?? null, rol]
    );
    return rows[0];
  },

  async update(idUsuario, data, db = pool) {
    const fields = [];
    const vals = [];
    let i = 1;
    if (data.nombre != null) {
      vals.push(data.nombre);
      fields.push(`nombre = $${i++}`);
    }
    if (data.email != null) {
      vals.push(data.email);
      fields.push(`email = $${i++}`);
    }
    if (data.password != null) {
      vals.push(data.password);
      fields.push(`password = $${i++}`);
    }
    if (data.telefono !== undefined) {
      vals.push(data.telefono);
      fields.push(`telefono = $${i++}`);
    }
    if (data.rol != null) {
      vals.push(data.rol);
      fields.push(`rol = $${i++}::tipo_rol`);
    }
    if (data.activo != null) {
      vals.push(data.activo);
      fields.push(`activo = $${i++}`);
    }
    if (!fields.length) {
      return this.findById(idUsuario, db);
    }
    fields.push(`updatedat = CURRENT_TIMESTAMP`);
    vals.push(idUsuario);
    const { rows } = await db.query(
      `UPDATE usuario SET ${fields.join(", ")} WHERE idusuario = $${i} RETURNING idusuario, nombre, email, telefono, rol, activo, createdat, updatedat`,
      vals
    );
    return rows[0] ?? null;
  }
};
