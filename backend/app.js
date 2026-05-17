import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false, // Allows cross-origin requests for resources
}));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow frontend origins
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());

// Archivos públicos subidos (imágenes)
app.use("/uploads", (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // Allow specific frontend origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}, express.static(path.join(process.cwd(), "uploads")));

app.use(env.API_PREFIX, apiRouter);
app.use(notFound);
app.use(errorHandler);
