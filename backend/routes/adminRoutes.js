import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import {
  listUsers,
  editUser,
  deleteUser,
  unblockUser,
  deletePost,
  getAllReports,
  getUserSubscriptions,
  getUserPosts,
  listSubscriptions
} from "../controllers/adminController.js";

const router = express.Router();

// Listar todos los usuarios
router.get("/users", authMiddleware, adminMiddleware, listUsers);

// Obtener suscripciones de un usuario específico
router.get("/users/:userId/subscriptions", authMiddleware, adminMiddleware, getUserSubscriptions);

// Obtener posts de un usuario específico
router.get("/users/:userId/posts", authMiddleware, adminMiddleware, getUserPosts);

// Listar todas las suscripciones
router.get("/subscriptions", authMiddleware, adminMiddleware, listSubscriptions);

// Editar un usuario
router.patch("/users/:userId", authMiddleware, adminMiddleware, editUser);

// Bloquear o eliminar un usuario
router.delete("/users/:userId", authMiddleware, adminMiddleware, deleteUser);

router.delete('/posts/:postId', authMiddleware, adminMiddleware, deletePost);

// Ruta para desbloquear un usuario
router.patch('/users/:userId/unblock', authMiddleware, adminMiddleware, unblockUser);

// Ruta para obtener todos los reportes 
router.get('/reports', authMiddleware, adminMiddleware, getAllReports);

export default router;
