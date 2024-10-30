// controllers/userController.js
import User from "../models/User.js";
import { validationResult } from "express-validator";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import fs from "fs-extra";
import bcrypt from "bcrypt";


// @desc Obtener el perfil actual del usuario autenticado
// @route GET /profile/current
export const getCurrentUserProfile = async (req, res) => {
  try {
    // Obtener el ID del usuario autenticado desde el middleware de autenticación
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("-password") // Excluir el campo de contraseña
      .populate({
        path: "posts",
        model: "Post",
        match: { isDelete: false }, // Solo incluir posts que no están eliminados
        populate: [
          { path: "author", select: "username profilePicture" },
          { path: "likes", select: "username" },
          {
            path: "comments",
            populate: { path: "author", select: "username profilePicture" }
          }
        ]
      })
      .populate("followers", "username profilePicture")
      .populate("following", "username profilePicture");

    // Verificar si el usuario existe
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado o eliminado" });
    }

    // Excluir la contraseña del objeto de respuesta y devolver el perfil del usuario
    const { password, ...userProfile } = user.toObject();
    res.json(userProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};


// @desc Buscar usuarios por nombre de usuario
// @route GET /profile/users?username=xxx
export const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ msg: "Por favor, proporciona un término de búsqueda." });
    }

    // Buscar usuarios cuyo nombre de usuario contenga el término de búsqueda, ignorando mayúsculas/minúsculas
    const users = await User.find({
      username: { $regex: username, $options: 'i' }, // 'i' para ignorar mayúsculas
      _id: { $ne: req.user.id } // Excluir al usuario autenticado
    }).select('username profilePicture'); // Seleccionar solo los campos necesarios

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Obtener el perfil de un usuario por su username
// @route GET /profile/:username
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Buscar el usuario por username e incluir los detalles de los posts
    const user = await User.findOne({ username, isDelete: false })
      .select("-password")
      .populate({
        path: "posts",
        model: "Post",
        match: { isDelete: false }, // Solo posts que no están eliminados
        populate: [
          { path: "author", select: "username profilePicture" }, // Obtener detalles del autor
          { path: "likes", select: "username" },                 // Obtener lista de usuarios que dieron like
          {
            path: "comments",
            populate: { path: "author", select: "username profilePicture" } // Obtener detalles de comentarios y autores de los mismos
          }
        ]
      });

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Actualizar el perfil de un usuario
// @route PATCH /profile/:userId
export const updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Verificar que el usuario está intentando actualizar su propio perfil
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: "Acción no autorizada" });
    }

    const { username, bio, password, confirmPassword } = req.body;

    // Verificar si el nuevo nombre de usuario ya está en uso por otro usuario
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ msg: "Este nombre de usuario ya está en uso" });
      }
    }

    let user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Actualizar campos permitidos
    user.username = username || user.username;
    user.bio = bio || user.bio;

    // Validar y actualizar contraseña si se proporciona
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        return res.status(400).json({ msg: "Las contraseñas no coinciden" });
      }
      if (password.length < 6) {
        return res.status(400).json({ msg: "La contraseña debe tener al menos 6 caracteres" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Actualizar la foto de perfil si es necesario
    if (req.files?.img) {
      if (user.profilePicture?.public_id) {
        await deleteImage(user.profilePicture.public_id);
      }
      const result = await uploadImage(req.files.img.tempFilePath, "profilesImg");
      user.profilePicture = { public_id: result.public_id, secure_url: result.secure_url };
      await fs.promises.unlink(req.files.img.tempFilePath);
    }

    await user.save();
    const { password: pwd, ...userData } = user.toObject();
    res.json({ msg: "Perfil actualizado con éxito", user: userData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};


// @desc Eliminar perfil de usuario
// @route DELETE /profile/:userId
export const deleteUserProfile = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { isDelete: true });
    res.json({ msg: "Perfil eliminado correctamente" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Seguir o dejar de seguir a un usuario
// @route POST /profile/:userId/toggleFollow
export const toggleFollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar si el usuario intenta seguirse o dejar de seguirse a sí mismo
    if (req.user.id === userId) {
      return res.status(400).json({ msg: "No puedes seguirte o dejar de seguirte a ti mismo" });
    }

    // Buscar ambos usuarios: el que está haciendo la acción y el que será seguido/dejado de seguir
    const user = await User.findById(req.user.id);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Verificar si ya sigue al usuario objetivo
    const alreadyFollowing = user.following.includes(userId);

    if (alreadyFollowing) {
      // Dejar de seguir: eliminar del array de following y followers
      user.following = user.following.filter((id) => id.toString() !== userId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== req.user.id);

      await Promise.all([user.save(), targetUser.save()]);

      return res.json({ msg: `Has dejado de seguir a ${targetUser.username}`, following: false });
    } else {
      // Seguir: agregar al array de following y followers
      user.following.push(userId);
      targetUser.followers.push(req.user.id);

      await Promise.all([user.save(), targetUser.save()]);

      return res.json({ msg: `Ahora sigues a ${targetUser.username}`, following: true });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};


// @desc Obtener la lista de seguidores de un usuario
// @route GET /profile/:userId/followers
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, isDelete: false })
      .populate("followers", "username profilePicture")
      .select("followers");

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado o eliminado" });
    }

    res.json(user.followers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Obtener la lista de usuarios que sigue un usuario
// @route GET /profile/:userId/following
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, isDelete: false })
      .populate("following", "username profilePicture")
      .select("following");

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado o eliminado" });
    }

    res.json(user.following);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};
