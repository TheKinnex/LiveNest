import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { createConversation, getUserConversations } from '../controllers/conversationController.js';

const router = express.Router();

// Ruta para crear una nueva conversación
router.post('/', authMiddleware, createConversation);

// Ruta para obtener todas las conversaciones de un usuario
router.get('/', authMiddleware, getUserConversations);

export default router;
