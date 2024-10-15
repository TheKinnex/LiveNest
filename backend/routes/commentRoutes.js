import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { deleteComment, editComment } from '../controllers/commentController.js';

const router = express.Router();

// Ruta para eliminar un comentario (dueño del post, autor del comentario, o admin)
router.delete('/:commentId', authMiddleware, deleteComment);

// Ruta para editar un comentario (solo autor del comentario)
router.patch('/:commentId', authMiddleware, editComment);

export default router;