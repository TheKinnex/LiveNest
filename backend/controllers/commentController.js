import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

// @desc Eliminar un comentario
// @route DELETE /comments/:commentId
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId).populate("post");

    if (!comment) {
      return res.status(404).json({ msg: "Comentario no encontrado" });
    }

    const post = await Post.findById(comment.post._id); // Obtener el post relacionado

    if (!post) {
      return res.status(404).json({ msg: "Post no encontrado" });
    }

    // Verificar si el usuario es el autor del comentario, el dueño del post, o un administrador
    if (
      comment.author.toString() !== req.user.id && // Autor del comentario
      post.author.toString() !== req.user.id && // Dueño del post
      req.user.role !== "admin" // Administrador
    ) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para eliminar este comentario" });
    }

    // Marcar el comentario como eliminado (soft delete)
    comment.isDelete = true;
    await comment.save();

    res.json({ msg: "Comentario marcado como eliminado exitosamente" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};



// @desc Editar un comentario
// @route PATCH /comments/:commentId
export const editComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.length > 500) {
      return res.status(400).json({
        msg: "El comentario no puede estar vacío y debe tener menos de 500 caracteres",
      });
    }

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ msg: "Comentario no encontrado" });
    }

    // Verificar si el usuario es el autor del comentario
    if (comment.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para editar este comentario" });
    }

    // Actualizar el contenido del comentario
    comment.content = content;
    comment.updatedAt = Date.now(); // Esto ya lo maneja Mongoose automáticamente
    await comment.save();

    res.json({ msg: "Comentario actualizado correctamente", comment });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};


/* 

Curioso que el controlador para crear un comentario no este en este archivo

*/
