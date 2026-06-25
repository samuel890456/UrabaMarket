import { pool } from "../config/database.js";

const USER_SELECT = `
  SELECT
    u.idusuario,
    u.nombre,
    u.email,
    u.password,
    u.telefono,
    u.avatarurl,
    u.activo,
    u.createdat,
    u.updatedat,
    COALESCE(
      array_agg(DISTINCT r.nombre) FILTER (WHERE r.nombre IS NOT NULL),
      ARRAY[]::text[]
    ) AS roles,
    MIN(r.nombre) AS primaryrole
  FROM usuario u
  LEFT JOIN usuariorol ur ON ur.idusuario = u.idusuario
  LEFT JOIN rol r ON r.idrol = ur.idrol
`;

const USER_GROUP = `
  GROUP BY u.idusuario, u.nombre, u.email, u.password, u.telefono, u.avatarurl, u.activo, u.createdat, u.updatedat
`;

export const usuarioModel = {
  async findByEmail(email, db = pool) {
    const { rows } = await db.query(
      `${USER_SELECT}
       WHERE LOWER(u.email) = LOWER($1)
       ${USER_GROUP}`,
      [email]
    );
    return rows[0] ?? null;
  },

  async findById(idUsuario, db = pool) {
    const { rows } = await db.query(
      `${USER_SELECT}
       WHERE u.idusuario = $1
       ${USER_GROUP}`,
      [idUsuario]
    );
    return rows[0] ?? null;
  },

  async count(whereRol = null, q = null, db = pool) {
    const params = [];
    const parts = [];
    let n = 1;

    if (whereRol) {
      params.push(whereRol);
      parts.push(`EXISTS (
        SELECT 1
        FROM usuariorol fur
        INNER JOIN rol fr ON fr.idrol = fur.idrol
        WHERE fur.idusuario = u.idusuario AND fr.nombre = $${n++}
      )`);
    }
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      parts.push(`(LOWER(u.nombre) LIKE $${n} OR LOWER(u.email) LIKE $${n} OR LOWER(COALESCE(u.telefono, '')) LIKE $${n})`);
    }
    if (parts.length) {
      const { rows } = await db.query(
        `SELECT COUNT(DISTINCT u.idusuario)::int AS n
         FROM usuario u
         WHERE ${parts.join(" AND ")}`,
        params
      );
      return rows[0]?.n ?? 0;
    }
    const { rows } = await db.query(`SELECT COUNT(*)::int AS n FROM usuario`);
    return rows[0]?.n ?? 0;
  },

  async list({ limit, offset, rol = null, q = null }, db = pool) {
    const params = [];
    const parts = [];
    let n = 1;
    if (rol) {
      params.push(rol);
      parts.push(`EXISTS (
        SELECT 1
        FROM usuariorol fur
        INNER JOIN rol fr ON fr.idrol = fur.idrol
        WHERE fur.idusuario = u.idusuario AND fr.nombre = $${n++}
      )`);
    }
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      parts.push(`(LOWER(u.nombre) LIKE $${n} OR LOWER(u.email) LIKE $${n} OR LOWER(COALESCE(u.telefono, '')) LIKE $${n})`);
      n += 1;
    }
    const where = parts.length ? `WHERE ${parts.join(" AND ")}` : "";
    params.push(limit, offset);
    const lim = params.length - 1;
    const off = params.length;
    const { rows } = await db.query(
      `${USER_SELECT}
       ${where}
       ${USER_GROUP}
       ORDER BY u.idusuario DESC
       LIMIT $${lim} OFFSET $${off}`,
      params
    );
    return rows;
  },

  async create({ nombre, email, password, telefono }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO usuario (nombre, email, password, telefono)
       VALUES ($1, $2, $3, $4)
       RETURNING idusuario, nombre, email, password, telefono, avatarurl, activo, createdat, updatedat`,
      [nombre, email, password, telefono ?? null]
    );
    return rows[0];
  },

  async findRoleByName(nombre, db = pool) {
    const { rows } = await db.query(`SELECT * FROM rol WHERE nombre = $1`, [nombre]);
    return rows[0] ?? null;
  },

  async addRoleByName(idUsuario, nombreRol, db = pool) {
    const role = await this.findRoleByName(nombreRol, db);
    if (!role) return null;
    await db.query(
      `INSERT INTO usuariorol (idusuario, idrol)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [idUsuario, role.idrol]
    );
    return role;
  },

  async setRolesByName(idUsuario, roles, db = pool) {
    await db.query(`DELETE FROM usuariorol WHERE idusuario = $1`, [idUsuario]);
    for (const rol of roles) {
      await this.addRoleByName(idUsuario, rol, db);
    }
    return this.findById(idUsuario, db);
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
    if (data.avatarUrl !== undefined) {
      vals.push(data.avatarUrl);
      fields.push(`avatarurl = $${i++}`);
    }
    if (data.activo !== undefined) {
      vals.push(data.activo);
      fields.push(`activo = $${i++}`);
    }

    if (fields.length) {
      fields.push(`updatedat = CURRENT_TIMESTAMP`);
      vals.push(idUsuario);
      await db.query(`UPDATE usuario SET ${fields.join(", ")} WHERE idusuario = $${i}`, vals);
    }

    if (data.roles !== undefined || data.rol !== undefined) {
      const nextRoles = data.roles ?? (data.rol ? [data.rol] : []);
      return this.setRolesByName(idUsuario, nextRoles, db);
    }

    return this.findById(idUsuario, db);
  }
};
