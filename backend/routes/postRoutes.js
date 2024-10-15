// routes/postRoutes.js
import express from "express";
import {
  createPost,
  toggleLikePost,
  commentPost,
  deletePost,
  updatePostContent,
  getPost,
  reportPost,
  getFeed
} from "../controllers/postController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { postOwnershipMiddleware } from "../middlewares/postOwnershipMiddleware.js";

const router = express.Router();



// Ruta para crear un post
router.post("/", authMiddleware, createPost);

// Ruta para obtener el feed (usuarios seguidos + recomendaciones)
router.get('/feed', authMiddleware, getFeed);

// Ruta para obtener Post
router.get("/:postId", authMiddleware, getPost)

// Ruta para dar o quitar like de un post
router.post("/:postId/like", authMiddleware, toggleLikePost);

// Ruta para comentar en un post
router.post("/:postId/comment", authMiddleware, commentPost);

// Ruta para eliminar un post (solo el autor puede eliminarlo)
router.delete("/:postId", authMiddleware, postOwnershipMiddleware, deletePost);

// Ruta para actualizar el contenido de un post (solo el autor puede actualizarlo)
router.patch(
  "/:postId",
  authMiddleware,
  postOwnershipMiddleware,
  updatePostContent
);

// Ruta para reportar un post
router.post('/:postId/report', authMiddleware, reportPost);

export default router;
