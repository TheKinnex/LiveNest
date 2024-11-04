import express from "express";
import {
  createSubscriptionTransaction,
  captureSubscriptionTransaction,
  cancelSubscriptionTransaction,
  getPaymentHistory
} from "../controllers/transactionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // Middleware para autenticar usuarios

const router = express.Router();

// @desc Crear una transacción de PayPal para suscripción
// @route POST /payments/create
router.post("/create", authMiddleware, createSubscriptionTransaction);

// @desc Capturar el pago de una suscripción
// @route GET /payments/success
router.get("/success", captureSubscriptionTransaction);

// @desc Manejar la cancelación del pago
// @route GET /payments/cancel
router.get('/cancel', authMiddleware, cancelSubscriptionTransaction);

// @desc Obtener historial de pagos del usuario logueado
// @route GET /payments/history
router.get("/history", authMiddleware, getPaymentHistory);

export default router;
