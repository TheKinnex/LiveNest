import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { uploadImage } from "../utils/cloudinary.js";
import fs from "fs-extra";

// @desc Crear un nuevo post
// @route POST /posts
export const createPost = async (req, res) => {
  try {
    const { content, tags } = req.body;
    const author = req.user.id;

    // Verificar si hay archivos multimedia
    let mediaArray = [];

    if (req.files && req.files.media) {
      // Si solo es un archivo, convertirlo en un array para iterar sobre él
      const mediaFiles = Array.isArray(req.files.media)
        ? req.files.media
        : [req.files.media];

      // Limitar la cantidad de imágenes/videos a 20
      if (mediaFiles.length > 20) {
        return res
          .status(400)
          .json({ msg: "Solo se permite subir un máximo de 20 archivos." });
      }

      // Subir cada archivo a Cloudinary
      for (const file of mediaFiles) {
        const result = await uploadImage(file.tempFilePath, "postsMedia");
        mediaArray.push({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });

        // Eliminar el archivo temporal
        await fs.unlink(file.tempFilePath);
      }
    }

    // Crear un nuevo post con los archivos multimedia y tags
    const newPost = new Post({
      author,
      content,
      media: mediaArray,
      tags: tags || [], // Guardar las tags si existen
    });

    // Guardar el post en la base de datos
    const savedPost = await newPost.save();

    // Vincular el post con el usuario
    const user = await User.findById(author);
    user.posts.push(savedPost._id); // Agregar el post al array de posts del usuario
    await user.save();

    res.status(201).json({ msg: "Post creado exitosamente", post: newPost });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Obtener el feed de publicaciones (usuarios seguidos + recomendaciones)
// @route GET /feed
export const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener el usuario autenticado
    const user = await User.findById(userId).populate("following", "username");

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Obtener las publicaciones de los usuarios seguidos
    const followedUserIds = user.following.map((follow) => follow._id);
    let posts = await Post.find({
      author: { $in: followedUserIds },
      isDelete: false,
    })
      .sort({ createdAt: -1 })
      .limit(20) // Limitar el número de publicaciones a 20
      .populate("author", "username profilePicture");

    // Si no hay suficientes publicaciones, generar recomendaciones basadas en tags
    if (posts.length === 0) {
      // Encontrar los tags más comunes en las publicaciones del usuario
      const userPosts = await Post.find({ author: userId, isDelete: false });
      const userTags = userPosts.flatMap((post) => post.tags);

      // Encontrar publicaciones similares basadas en tags
      let recommendations = await Post.find({
        tags: { $in: userTags }, // Basado en tags similares
        author: { $ne: userId }, // No incluir los posts del propio usuario
        isDelete: false,
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("author", "username profilePicture");

      // Enviar recomendaciones si no hay posts de los seguidos
      return res.json({
        msg: "Recomendaciones basadas en tus tags",
        posts: recommendations,
      });
    }

    // Si hay posts de los seguidos, enviarlos
    res.json({ msg: "Publicaciones de usuarios seguidos", posts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Obtener un Post
// @route POST /posts/:postId
export const getPost = async (req, res) => {
  try {
    // Obtener el post y popular el autor y comentarios
    const post = await Post.findById(req.params.postId)
      .populate("author", "username profilePicture") // Popular detalles del autor
      .populate({
        path: "comments",
        match: { isDelete: false }, // Solo mostrar comentarios que no estén eliminados
        populate: { path: "author", select: "username profilePicture" }, // Popular el autor de cada comentario
      });

    if (!post) {
      return res.status(404).json({ msg: "Post no encontrado" });
    }

    // Si el post no está eliminado, mostrarlo
    if (!post.isDelete) {
      return res.json(post);
    }

    // Si el post está eliminado (isDelete: true), verificar permisos especiales
    const isOwner = post.author._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    // Si es administrador, mostrar el post eliminado
    if (isAdmin) {
      return res.json(post);
    }

    // Si es el dueño del post, verificar que puede verlo por solo 1 hora
    if (isOwner) {
      const currentTime = new Date();
      const timeDifference = (currentTime - post.updatedAt) / (1000 * 60 * 60); // Diferencia en horas

      if (timeDifference <= 1) {
        return res.json(post); // Mostrar el post si ha pasado menos de 1 hora
      } else {
        return res
          .status(403)
          .json({ msg: "El post fue eliminado y ya no puedes verlo." });
      }
    }

    // Si no es el dueño ni un administrador, denegar acceso
    return res
      .status(403)
      .json({ msg: "No tienes permiso para ver este post eliminado." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Dar o quitar like de un post
// @route POST /posts/:postId/like
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ msg: "Post no encontrado" });
    }

    // Verificar si el usuario ya dio like al post
    const hasLiked = post.likes.includes(req.user.id);

    if (hasLiked) {
      // Si ya le dio like, quitar el like
      post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user.id
      );
      await post.save();
      return res.json({ msg: "Like eliminado", post });
    } else {
      // Si no le dio like, agregar el like
      post.likes.push(req.user.id);
      await post.save();
      return res.json({ msg: "Like agregado", post });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Comentar en un post
// @route POST /posts/:postId/comment
export const commentPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res
        .status(400)
        .json({ msg: "El comentario no puede estar vacío" });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ msg: "Post no encontrado" });
    }

    // Crear y guardar el comentario en la base de datos
    const newComment = new Comment({
      author: req.user.id,
      post: req.params.postId,
      content,
      createdAt: new Date(),
    });

    await newComment.save();

    // Agregar la referencia del comentario al post (su ObjectId)
    post.comments.push(newComment._id);
    await post.save();

    res.status(201).json({
      msg: "Comentario agregado exitosamente",
      post,
      comment: newComment,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Actualizar el contenido de un post (solo la descripción, y tags solo el autor puede actualizarlo)
// @route PATCH /posts/:postId
export const updatePostContent = async (req, res) => {
  try {
    const { content, tags } = req.body;

    // Validar que el contenido no esté vacío y que sea menor a 500 caracteres
    if (!content || content.length > 500) {
      return res
        .status(400)
        .json({ msg: "El contenido debe tener menos de 500 caracteres" });
    }

    // Limitar la cantidad de tags
    if (tags && tags.length > 10) {
      return res
        .status(400)
        .json({ msg: "Solo se permiten un máximo de 10 tags." });
    }

    // Buscar el post por su ID
    const post = await Post.findById(req.params.postId);

    // Verificar si el post existe
    if (!post) {
      return res.status(404).json({ msg: "Post no encontrado" });
    }

    // Verificar si el post está eliminado
    if (post.isDelete) {
      return res
        .status(403)
        .json({ msg: "No puedes editar un post eliminado" });
    }

    // Verificar si el usuario es el autor del post
    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para actualizar este post" });
    }

    // Actualizar solo el contenido y las tags
    post.content = content;
    post.tags = tags || []; // Actualizar las tags si se proporcionan
    post.updatedAt = Date.now();
    await post.save();

    res.json({ msg: "Post actualizado correctamente", post });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Eliminar un post (solo el autor puede eliminarlo)
// @route DELETE /posts/:postId
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ msg: "Post no encontrado" });
    }

    // Verificar si el usuario es el autor del post
    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para eliminar este post" });
    }

    // Soft delete, si no quieres eliminar físicamente el post
    post.isDelete = true;
    await post.save();

    res.json({ msg: "Post eliminado correctamente" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Reportar un post
// @route POST /posts/:postId/report
export const reportPost = async (req, res) => {
  try {
    const { reason } = req.body;

    // Verificar si la razón del reporte es válida
    if (!reason || reason.length > 500) {
      return res
        .status(400)
        .json({
          msg: "Debes proporcionar una razón válida (máximo 500 caracteres).",
        });
    }

    // Buscar el post a reportar
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ msg: "Post no encontrado" });
    }

    // Verificar si el usuario ya ha reportado este post
    const existingReport = await Report.findOne({
      post: req.params.postId,
      reportedBy: req.user.id,
    });

    if (existingReport) {
      return res.status(400).json({ msg: "Ya has reportado este post." });
    }

    // Crear un nuevo reporte
    const report = new Report({
      post: req.params.postId,
      reportedBy: req.user.id,
      reason,
    });

    await report.save();

    res.status(201).json({ msg: "Reporte enviado exitosamente.", report });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};
