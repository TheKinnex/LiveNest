import Post from "../models/Post.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { uploadImage, uploadVideo } from "../utils/cloudinary.js";
import fs from "fs-extra";
import Subscription from "../models/Subscription.js";

// @desc Crear un nuevo post
// @route POST /posts
export const createPost = async (req, res) => {
  try {
    const { content, tags } = req.body;
    const author = req.user.id;

    // Verificar si el usuario tiene una suscripción "paid" activa
    const paidSubscription = await Subscription.findOne({
      subscriber: author,
      plan: "paid",
      isActive: true,
      endDate: { $gte: new Date() }, // Asegurar que la suscripción no haya expirado
    });

    // Verificar si el usuario es premium
    const isPremium = !!paidSubscription;

    // Manejar archivos multimedia
    let mediaArray = [];

    if (req.files && req.files.media) {
      // Convertir a array si solo es un archivo
      const mediaFiles = Array.isArray(req.files.media)
        ? req.files.media
        : [req.files.media];

      // Limitar la cantidad de archivos
      if (mediaFiles.length > 20) {
        return res
          .status(400)
          .json({ msg: "Solo se permite subir un máximo de 20 archivos." });
      }

      for (const file of mediaFiles) {
        // Determinar el tipo de archivo
        const fileType = file.mimetype.startsWith('video/') ? 'video' : 'image';

        if (fileType === 'video' && !isPremium) {
          return res.status(403).json({ msg: "Necesitas una suscripción premium para subir videos." });
        }

        if (fileType === 'image') {
          const result = await uploadImage(file.tempFilePath, "postsMedia");
          mediaArray.push({
            public_id: result.public_id,
            secure_url: result.secure_url,
            type: 'image',
          });
        } else if (fileType === 'video') {
          const result = await uploadVideo(file.tempFilePath, "postsMedia");
          
          // Log de la respuesta de Cloudinary
          //console.log("Resultado de subida de video:", result);

          mediaArray.push({
            public_id: result.public_id,
            secure_url: result.secure_url,
            type: 'video',
            thumbnail: result.eager && result.eager.length > 0 ? result.eager[0].secure_url : '',
          });
        }

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

    // Obtener el usuario autenticado y sus seguidos
    const user = await User.findById(userId).populate("following", "username");

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const followedUserIds = user.following.map((follow) => follow._id);

    // Definir cuántos posts queremos en el feed
    const POSTS_LIMIT = parseInt(req.query.limit) || 1;
    const PAGE = parseInt(req.query.page) || 1;
    const SKIP = (PAGE - 1) * POSTS_LIMIT;

    // 1. Obtener publicaciones de usuarios seguidos
    const followedPostsPromise = Post.find({
      author: { $in: followedUserIds },
      isDelete: false,
    })
      .sort({ createdAt: -1 })
      .skip(SKIP)
      .limit(POSTS_LIMIT)
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        match: { isDelete: false },
        populate: { path: "author", select: "username profilePicture" },
      })
      .lean();

    // 2. Obtener recomendaciones basadas en tags
    const userPosts = await Post.find({ author: userId, isDelete: false }).select("tags").lean();
    const userTags = userPosts.flatMap(post => post.tags);

    let recommendedPosts = [];

    if (userTags.length > 0) {
      recommendedPosts = await Post.find({
        tags: { $in: userTags },
        author: { $nin: [...followedUserIds, userId] },
        isDelete: false,
      })
        .sort({ createdAt: -1 })
        .skip(SKIP)
        .limit(POSTS_LIMIT)
        .populate("author", "username profilePicture")
        .populate({
          path: "comments",
          match: { isDelete: false },
          populate: { path: "author", select: "username profilePicture" },
        })
        .lean();
    }

    // 3. Si no hay suficientes recomendaciones, obtener publicaciones adicionales de otros usuarios no seguidos
    const additionalPostsLimit = POSTS_LIMIT - recommendedPosts.length;
    let additionalPosts = [];

    if (additionalPostsLimit > 0) {
      additionalPosts = await Post.find({
        author: { $nin: [...followedUserIds, userId] },
        isDelete: false,
      })
        .sort({ createdAt: -1 })
        .skip(SKIP)
        .limit(additionalPostsLimit)
        .populate("author", "username profilePicture")
        .populate({
          path: "comments",
          match: { isDelete: false },
          populate: { path: "author", select: "username profilePicture" },
        })
        .lean();
    }

    // 4. Obtener publicaciones populares si el usuario no sigue a nadie
    if (followedUserIds.length === 0) {
      recommendedPosts = await Post.find({
        isDelete: false,
      })
        .sort({ createdAt: -1 })
        .skip(SKIP)
        .limit(POSTS_LIMIT)
        .populate("author", "username profilePicture")
        .populate({
          path: "comments",
          match: { isDelete: false },
          populate: { path: "author", select: "username profilePicture" },
        })
        .lean();
    }

    // 5. Combinar publicaciones seguidas, recomendaciones y adicionales
    const followedPosts = await followedPostsPromise;
    let feedPosts = [...followedPosts, ...recommendedPosts, ...additionalPosts];

    // 6. Limitar el feed al POSTS_LIMIT
    feedPosts = feedPosts.slice(0, POSTS_LIMIT);

    // 7. Contar el total de publicaciones para paginación
    const totalPosts = await Post.countDocuments({
      $or: [
        { author: { $in: followedUserIds } },
        { tags: { $in: userTags }, author: { $nin: [...followedUserIds, userId] } },
        { author: { $nin: [...followedUserIds, userId] } },
      ],
      isDelete: false,
    });

    const totalPages = Math.ceil(totalPosts / POSTS_LIMIT);

    res.json({ 
      msg: "Feed de publicaciones", 
      posts: feedPosts,
      currentPage: PAGE,
      totalPages,
      totalPosts,
    });
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
// @route POST /posts/:postId/toggleLike
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

    // Obtener los detalles del autor (usuario autenticado)
    const authorDetails = await User.findById(req.user.id).select('username profilePicture');

    // Agregar los detalles del autor al comentario antes de enviarlo al frontend
    const commentWithAuthor = {
      ...newComment.toObject(),
      author: {
        _id: authorDetails._id,
        username: authorDetails.username,
        profilePicture: authorDetails.profilePicture,
      },
    };

    res.status(201).json({
      msg: "Comentario agregado exitosamente",
      post,
      comment: commentWithAuthor,
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

    // Verificar si el post está marcado como eliminado
    if (post.isDelete) {
      return res
        .status(403)
        .json({ msg: "No puedes editar un post eliminado" });
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


// @desc Eliminar un post (solo el autor o un administrador puede eliminarlo)
// @route DELETE /posts/:postId
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ msg: "Post no encontrado" });
    }

    const user = await User.findById(req.user.id);

    // Verificar si el usuario es el autor del post o un administrador
    if (post.author.toString() !== user._id.toString() && user.role !== "admin") {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para eliminar este post" });
    }

    // Marcar el post como eliminado (soft delete)
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
