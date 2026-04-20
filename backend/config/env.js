import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default("/api/v1"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerida"),
  JWT_SECRET: z.string().min(8).default("urabamarket-dev-cambiar-en-produccion"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_ROUNDS: z.coerce.number().min(4).max(15).default(10)
});

export const env = schema.parse(process.env);
