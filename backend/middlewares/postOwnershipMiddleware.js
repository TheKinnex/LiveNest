import Post from "../models/Post.js";
import User from "../models/User.js";

// Middleware para verificar si el post pertenece al usuario autenticado o si es un administrador
export const postOwnershipMiddleware = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ msg: "Post no encontrado" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    console.log("Post Author:", post.author.toString());
    console.log("User ID:", user._id.toString());
    console.log("User Role:", user.role);

    // Verificar si el usuario es el autor del post o un administrador
    if (post.author.toString() !== user._id.toString() && user.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para modificar este post" });
    }

    // Si el post le pertenece o es administrador, continuar con la siguiente función
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};
