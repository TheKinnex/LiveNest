import User from "../models/User.js";
import Post from "../models/Post.js";
import Report from '../models/Report.js'
import Subscriptions from '../models/Subscription.js'

// @desc Listar todos los usuarios
// @route GET /admin/users
export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Obtener suscripciones de un usuario
// @route GET /admin/users/:userId/subscriptions
export const getUserSubscriptions = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('subscriptions');
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    res.json(user.subscriptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Obtener posts de un usuario
// @route GET /admin/users/:userId/posts
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId, isDelete: false }).populate('author', 'username');
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Listar todas las suscripciones
// @route GET /admin/subscriptions
export const listSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscriptions.find().populate('subscriber', 'username');
    res.json(subscriptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};


// @desc Editar un usuario
// @route PATCH /admin/users/:userId
export const editUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    // Opciones para devolver el documento actualizado
    const options = { new: true, runValidators: true };

    // Actualiza solo los campos proporcionados
    const updatedFields = {};
    if (username) updatedFields.username = username;
    if (email) updatedFields.email = email;
    if (role) updatedFields.role = role;

    // Buscar y actualizar el usuario en un solo paso
    const user = await User.findByIdAndUpdate(req.params.userId, updatedFields, options);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json({ msg: "Usuario actualizado correctamente", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};


// @desc Bloquear o Desbloquear
// @route PATCH /admin/users/:userId/block
export const softBlockAndDelete = async (req, res) => {
  try {
    const { action } = req.body; // 'block' para bloquear, 'delete' para eliminar

    let user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    if (action === "block") {
      user.isBlocked = true;
      user.isDelete = false;
    } else if (action === "delete") {
      user.isBlocked = false;
      user.isDelete = true;
    } else {
      return res.status(400).json({ msg: "Acción no válida" });
    }

    await user.save();
    const statusMsg = action === "block" ? "bloqueado" : "desbloqueado";
    res.json({ msg: `Usuario ${statusMsg} correctamente`, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};


// @desc Desbloquear un usuario
// @route PATCH /admin/users/:userId/unblock
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    if (!user.isBlocked) {
      return res.status(400).json({ msg: 'El usuario ya está desbloqueado' });
    }

    user.isBlocked = false;
    await user.save();

    res.json({ msg: 'Usuario desbloqueado exitosamente', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};


// @desc Obtener todos los reportes
// @route GET /admin/reports
// @desc Obtener todos los reportes
// @route GET /admin/reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'username'
        }
      })
      .populate('reportedBy', 'username'); // Popular detalles del usuario que hizo el reporte

    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};


// @desc Marcar reporte como revisado
// @route PATCH /admin/reports/:reportId/review
export const markReportAsReviewed = async (req, res) => {
  try {
      const report = await Report.findById(req.params.reportId);

      if (!report) {
          return res.status(404).json({ msg: 'Reporte no encontrado' });
      }

      report.isReviewed = true;
      await report.save();

      res.json({ msg: 'Reporte marcado como revisado', report });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Error en el servidor');
  }
};

// @desc Eliminar reporte (soft delete)
// @route DELETE /admin/reports/:reportId
export const deleteReport = async (req, res) => {
  try {
      const report = await Report.findById(req.params.reportId);

      if (!report) {
          return res.status(404).json({ msg: 'Reporte no encontrado' });
      }

      report.isDelete = true;
      await report.save();

      res.json({ msg: 'Reporte eliminado' });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Error en el servidor');
  }
};


// @desc Eliminar contenido inapropiado (marcar como eliminado)
// @route DELETE /admin/posts/:postId
export const deletePost = async (req, res) => {
  try {
    // Buscar el post por su ID
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ msg: 'Post no encontrado' });
    }

    // Verificar si el post ya está marcado como eliminado
    if (post.isDelete) {
      return res.status(400).json({ msg: 'El post ya ha sido eliminado' });
    }

    // Marcar el post como eliminado (soft delete)
    post.isDelete = true;
    post.updatedAt = Date.now();
    await post.save();

    res.json({ msg: 'Post marcado como eliminado exitosamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};


// @desc Listar todos los posts
// @route GET /admin/posts
export const listPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isDelete: false }).populate('author', 'username');
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};
