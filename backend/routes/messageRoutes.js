import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const router = express.Router();

// Ruta para enviar un mensaje en una conversación
router.post('/:conversationId/send', authMiddleware, sendMessage);

// Ruta para obtener todos los mensajes de una conversación
router.get('/:conversationId', authMiddleware, getMessages);

export default router;
