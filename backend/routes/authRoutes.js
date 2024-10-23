// routes/authRoutes.js
import express from "express";
import { check } from "express-validator";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyUser
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Verificación de usuario
router.get('/verify', verifyUser);

// Ruta para registrar un nuevo usuario
router.post(
  "/register",
  [
    check(
      "username",
      "El nombre de usuario es obligatorio y debe tener al menos 3 caracteres"
    ).isLength({ min: 3 }),
    check("email", "Por favor ingrese un correo válido").isEmail(),
    check(
      "password",
      "La contraseña debe tener al menos 6 caracteres"
    ).isLength({ min: 6 }),
  ],
  register
);

// Ruta para iniciar sesión
router.post(
  "/login",
  [
    check("email", "Por favor ingrese un correo válido").isEmail(),
    check("password", "La contraseña es obligatoria").exists(),
  ],
  login
);

// Ruta para solicitar recuperación de contraseña
router.post(
  "/forgot-password",
  [check("email", "Por favor ingrese un correo válido").isEmail()],
  forgotPassword
);

// Ruta para restablecer la contraseña
router.post(
  "/reset-password/:token",
  [
    check(
      "password",
      "La contraseña debe tener al menos 6 caracteres"
    ).isLength({ min: 6 }),
  ],
  resetPassword
);

export default router;
