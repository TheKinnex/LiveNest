import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import {
  listUsers,
  editUser,
  softBlockAndDelete,
  unblockUser,
  deletePost,
  getAllReports,
  getUserSubscriptions,
  getUserPosts,
  markReportAsReviewed,
  deleteReport,
  listPosts,
  listSubscriptions
} from "../controllers/adminController.js";

const router = express.Router();

// Listar todos los usuarios
router.get("/users", authMiddleware, adminMiddleware, listUsers);

// Obtener suscripciones de un usuario específico
router.get("/users/:userId/subscriptions", authMiddleware, adminMiddleware, getUserSubscriptions);

// Ruta para obtener todos los posts 
router.get('/posts', authMiddleware, adminMiddleware, listPosts);

// Obtener posts de un usuario específico
router.get("/users/:userId/posts", authMiddleware, adminMiddleware, getUserPosts);

// Listar todas las suscripciones
router.get("/subscriptions", authMiddleware, adminMiddleware, listSubscriptions);

// Editar un usuario
router.patch("/users/:userId", authMiddleware, adminMiddleware, editUser);


router.delete('/posts/:postId', authMiddleware, adminMiddleware, deletePost);

// Ruta para bloquear un usuario
router.patch("/users/:userId/block", authMiddleware, adminMiddleware, softBlockAndDelete);

// Ruta para desbloquear un usuario
router.patch('/users/:userId/unblock', authMiddleware, adminMiddleware, unblockUser);


// Ruta para obtener todos los reportes 
router.get('/reports', authMiddleware, adminMiddleware, getAllReports);

// Rutas para Marcar como revisado
router.patch('/reports/:reportId/review', authMiddleware, adminMiddleware, markReportAsReviewed);

//Ruta para eliminar reporte (softDelete)
router.delete('/reports/:reportId', authMiddleware, adminMiddleware, deleteReport);



export default router;
