// routes/userRoutes.js
import express from 'express';
import { check } from 'express-validator';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  followUser,
  unfollowUser,
  getFollowers,      
  getFollowing,   
  searchUsers   
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizationMiddleware } from '../middlewares/authorizationMiddleware.js';

const router = express.Router();

// Ruta para buscar usuarios por nombre de usuario
router.get('/users', authMiddleware, searchUsers);

// Ver perfil de un usuario (excluir perfiles eliminados)
router.get('/:userId', authMiddleware, getUserProfile);

// Obtener lista de seguidores de un usuario
router.get('/:userId/followers', authMiddleware, getFollowers);

// Obtener lista de usuarios que sigue un usuario
router.get('/:userId/following', authMiddleware, getFollowing);

// Actualizar perfil de un usuario (solo el propietario)
router.patch(
  '/:userId',
  authMiddleware,
  authorizationMiddleware,
  [
    check('username', 'El nombre de usuario es obligatorio y debe tener al menos 3 caracteres').optional().isLength({ min: 3 }),
    check('bio', 'La biografía no puede tener más de 150 caracteres').optional().isLength({ max: 150 }),
  ],
  updateUserProfile
);

// Eliminar perfil de un usuario (solo el propietario)
router.delete('/:userId', authMiddleware, authorizationMiddleware, deleteUserProfile);

// Seguir a otro usuario
router.post('/:userId/follow', authMiddleware, followUser);

// Dejar de seguir a otro usuario
router.post('/:userId/unfollow', authMiddleware, unfollowUser);

export default router;
