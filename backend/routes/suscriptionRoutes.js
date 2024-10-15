import express from "express";
import {
    listSubscriptions,
    cancelSubscription,
    getUserSubscriptions
} from "../controllers/suscriptionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // Middleware para autenticar usuarios

const router = express.Router();

// @desc Obtener planes de suscripción
// @route POST /suscription/:chanelId
router.get("/:channelId", authMiddleware, listSubscriptions);

// @desc Obtener suscripciones activas
// @route GET /suscription
router.get("/", authMiddleware, getUserSubscriptions);

// @desc Crear una transacción de PayPal para suscripción
// @route DELETE /suscription/:chanelId
router.patch("/:channelId/cancel", authMiddleware, cancelSubscription);





export default router;