import express from "express";
import {
    listSubscriptionPlans,
    cancelSubscription,
    getUserSubscriptions
} from "../controllers/suscriptionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js"; // Middleware para autenticar usuarios

const router = express.Router();


// @desc Obtener suscripciones activas del usuario
// @route GET /suscriptions
router.get('/', authMiddleware, getUserSubscriptions);


// @desc Obtener los planes de suscripción
// @route GET /suscriptions/plans
router.get("/plans", authMiddleware, listSubscriptionPlans);


// @desc Cancelar una suscripción
// @route DELETE /suscriptions/cancel
router.patch('/cancel', authMiddleware, cancelSubscription);

export default router;