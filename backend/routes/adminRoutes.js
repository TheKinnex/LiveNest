import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import {
  listUsers,
  editUser,
  deleteUser,
  unblockUser,
  deletePost,
  getAllReports
} from "../controllers/adminController.js";

const router = express.Router();

// Listar todos los usuarios
router.get("/users", authMiddleware, adminMiddleware, listUsers);

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
