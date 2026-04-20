import { pool } from "../config/database.js";

export const direccionModel = {
  async findById(idDireccion, db = pool) {
    const { rows } = await db.query(`SELECT * FROM direccion WHERE iddireccion = $1`, [idDireccion]);
    return rows[0] ?? null;
  },

  async listByUsuario(idUsuario, db = pool) {
    const { rows } = await db.query(
      `SELECT * FROM direccion WHERE idusuario = $1 ORDER BY esprincipal DESC, iddireccion DESC`,
      [idUsuario]
    );
    return rows;
  },

  async create({ idUsuario, direccion, ciudad, esPrincipal = false }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO direccion (idusuario, direccion, ciudad, esprincipal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [idUsuario, direccion, ciudad ?? "Apartadó", esPrincipal]
    );
    return rows[0];
  },

  async update(idDireccion, data, db = pool) {
    const fields = [];
    const vals = [];
    let i = 1;
    if (data.direccion != null) {
      vals.push(data.direccion);
      fields.push(`direccion = $${i++}`);
    }
    if (data.ciudad != null) {
      vals.push(data.ciudad);
      fields.push(`ciudad = $${i++}`);
    }
    if (data.esPrincipal != null) {
      vals.push(data.esPrincipal);
      fields.push(`esprincipal = $${i++}`);
    }
    if (!fields.length) return this.findById(idDireccion, db);
    fields.push(`updatedat = CURRENT_TIMESTAMP`);
    vals.push(idDireccion);
    const { rows } = await db.query(
      `UPDATE direccion SET ${fields.join(", ")} WHERE iddireccion = $${i} RETURNING *`,
      vals
    );
    return rows[0] ?? null;
  },

  async delete(idDireccion, db = pool) {
    const { rowCount } = await db.query(`DELETE FROM direccion WHERE iddireccion = $1`, [
      idDireccion
    ]);
    return rowCount > 0;
  },

  async clearPrincipalForUser(idUsuario, db = pool) {
    await db.query(`UPDATE direccion SET esprincipal = FALSE WHERE idusuario = $1`, [idUsuario]);
  }
};
