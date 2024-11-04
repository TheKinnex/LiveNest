// routes/userRoutes.js
import express from 'express';
import { check } from 'express-validator';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  toggleFollowUser,
  getFollowers,      
  getFollowing,   
  searchUsers,
  getCurrentUserProfile, 
  getSuggestedUsers
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authorizationMiddleware } from '../middlewares/authorizationMiddleware.js';

const router = express.Router();


// Ruta para obtener la cuenta actual
router.get("/current", authMiddleware, getCurrentUserProfile);

// Ruta para obtener sugerencias de usuarios a seguir
router.get('/suggestions', authMiddleware, getSuggestedUsers);

// Ruta para buscar usuarios por nombre de usuario
router.get('/users', authMiddleware, searchUsers);

// Ver perfil de un usuario (excluir perfiles eliminados)
router.get('/:username', authMiddleware, getUserProfile);

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
    check('username', 'El nombre de usuario debe tener al menos 3 caracteres').optional().isLength({ min: 3 }),
    check('bio', 'La biografía no debe exceder 150 caracteres').optional().isLength({ max: 150 }),
    check('password', 'La contraseña debe tener al menos 6 caracteres').optional().isLength({ min: 6 }),
    check('confirmPassword', 'Confirma tu contraseña').optional().custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  ],
  updateUserProfile
);

// Eliminar perfil de un usuario (solo el propietario)
router.delete('/:userId', authMiddleware, authorizationMiddleware, deleteUserProfile);

// Seguir a otro usuario
router.post('/:userId/toggleFollow', authMiddleware, toggleFollowUser);



export default router;
