import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loginSchema, registerSchema } from "../validators/auth.validators.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  validate({ body: registerSchema }),
  asyncHandler(authController.register)
);
authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(authController.login));
