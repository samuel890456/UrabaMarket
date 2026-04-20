/**
 * Genera hash bcrypt para guardar en la columna password de usuario.
 * Uso: node scripts/hash-password.mjs [texto] [rondas]
 * Ejemplo: node scripts/hash-password.mjs admin123
 */
import bcrypt from "bcrypt";

const pwd = process.argv[2] ?? "admin123";
const rounds = Number(process.argv[3]) || 10;

const hash = await bcrypt.hash(pwd, rounds);
console.log(hash);
console.log("\nSQL ejemplo:\nUPDATE usuario SET password = '" + hash + "' WHERE email = 'admin@urabamarket.com';");
