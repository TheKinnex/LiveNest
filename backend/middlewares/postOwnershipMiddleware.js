import Post from "../models/Post.js";

// Middleware para verificar si el post pertenece al usuario autenticado
export const postOwnershipMiddleware = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ msg: "Post no encontrado" });
    }

    // Verificar si el usuario es el autor del post
    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para modificar este post" });
    }

    // Si el post le pertenece, continuar con la siguiente función
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};
