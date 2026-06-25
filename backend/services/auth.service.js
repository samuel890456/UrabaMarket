import bcrypt from "bcrypt";
import { pool } from "../config/database.js";
import { env } from "../config/env.js";
import { usuarioModel } from "../models/usuario.model.js";
import { tiendaModel } from "../models/tienda.model.js"; // Importar tiendaModel
import { proveedorModel } from "../models/proveedor.model.js"; // Importar proveedorModel
import { direccionModel } from "../models/direccion.model.js";
import { ApiError } from "../utils/ApiError.js";
import { mapUsuario } from "../utils/mappers.js";
import { signUserToken } from "../utils/jwt.js";

export async function register(body) { // Accept full body
  const { rol, email, password, telefono } = body;

  if (rol === "Administrador") {
    throw new ApiError.Forbidden("No puedes registrarte como administrador");
  }
  const exists = await usuarioModel.findByEmail(email);
  if (exists) {
    throw new ApiError.Conflict("El email ya esta registrado");
  }

  let nombreParaUsuario;
  if (rol === "Proveedor") {
    nombreParaUsuario = body.responsable;
  } else {
    nombreParaUsuario = body.nombre;
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const created = await usuarioModel.create({
      nombre: nombreParaUsuario, // Use the mapped name
      email,
      password: passwordHash,
      telefono: telefono ?? null
    }, client);
    const assignedRole = await usuarioModel.addRoleByName(created.idusuario, rol, client);
    if (!assignedRole) {
      throw new ApiError.BadRequest(`Rol no configurado: ${rol}`);
    }
    const user = mapUsuario(await usuarioModel.findById(created.idusuario, client));

    if (rol === "Vendedor") {
      const { nombreTienda, categoriaTienda, direccionTienda } = body;
      const idCategoria = categoriaTienda != null ? Number(categoriaTienda) : null;
      if (idCategoria != null && Number.isNaN(idCategoria)) {
        throw new ApiError.BadRequest("Categoría inválida");
      }
      await tiendaModel.create({
        idUsuario: user.idUsuario,
        idCategoria,
        nombre: nombreTienda,
        descripcion: null, // No se recoge en el formulario, asumimos null o vacío
        direccion: direccionTienda,
      }, client);
    } else if (rol === "Proveedor") {
      const { nombreEmpresa, productosQueDistribuye } = body;
      await proveedorModel.create({
        idUsuario: user.idUsuario,
        nombreEmpresa,
        productosQueDistribuye,
      }, client);
    } else if (rol === "Cliente" && body.direccion) {
      await direccionModel.create({
        idUsuario: user.idUsuario,
        direccion: body.direccion,
        ciudad: body.ciudad || "Apartadó",
        esPrincipal: body.esPrincipal ?? true
      }, client);
    }

    await client.query("COMMIT");
    const token = signUserToken({
      idUsuario: user.idUsuario,
      email: user.email,
      roles: user.roles
    });
    return { user, token };
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      throw new ApiError.Conflict("El email o registro asociado ya existe");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function login({ email, password }) {
  const row = await usuarioModel.findByEmail(email);
  if (!row || !row.activo) {
    throw new ApiError.Unauthorized("Credenciales invalidas");
  }
  const ok = await bcrypt.compare(password, row.password);
  if (!ok) {
    throw new ApiError.Unauthorized("Credenciales invalidas");
  }
  const user = mapUsuario(row);
  const token = signUserToken({
    idUsuario: user.idUsuario,
    email: user.email,
    roles: user.roles
  });
  return { user, token };
}
