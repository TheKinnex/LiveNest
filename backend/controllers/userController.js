// controllers/userController.js
import User from "../models/User.js";
import { validationResult } from "express-validator";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import fs from "fs-extra";

// @desc Obtener el perfil de un usuario por su ID
// @route GET /profile/:userId
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.userId,
      isDelete: false,
    }).select("-password");
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
    let user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Actualizar solo los campos permitidos
    const { username, bio } = req.body;
    user.username = username || user.username;
    user.bio = bio || user.bio;

    if (req.files?.img) {

      if (user.profilePicture?.public_id) {
        await deleteImage(user.profilePicture.public_id); // Solo eliminar si hay un public_id definido
      }
      const result = await uploadImage(
        req.files.img.tempFilePath,
        "profilesImg"
      );
      user.profilePicture = {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };

      await fs.unlink(req.files.img.tempFilePath);
    }

    await user.save();

    res.json({ msg: "Perfil actualizado con éxito", user });
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

// @desc Seguir a otro usuario
// @route POST /profile/:userId/follow
export const followUser = async (req, res) => {
  try {
    if (req.user.id === req.params.userId) {
      return res.status(400).json({ msg: "No puedes seguirte a ti mismo" });
    }

    const user = await User.findById(req.user.id);
    const userToFollow = await User.findById(req.params.userId);

    if (!userToFollow) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    if (user.following.includes(req.params.userId)) {
      return res.status(400).json({ msg: "Ya sigues a este usuario" });
    }

    user.following.push(req.params.userId);
    userToFollow.followers.push(req.user.id);

    await user.save();
    await userToFollow.save();

    res.json({ msg: `Ahora sigues a ${userToFollow.username}` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Dejar de seguir a otro usuario
// @route POST /profile/:userId/unfollow
export const unfollowUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userToUnfollow = await User.findById(req.params.userId);

    if (req.user.id === req.params.userId) {
      return res.status(400).json({
        msg: "No puedes dejar de seguirte a ti mismo porque no te sigues",
      });
    }

    if (!userToUnfollow) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    if (!user.following.includes(req.params.userId)) {
      return res.status(400).json({ msg: "No sigues a este usuario" });
    }

    user.following = user.following.filter(
      (id) => id.toString() !== req.params.userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user.id
    );

    await user.save();
    await userToUnfollow.save();

    res.json({ msg: `Has dejado de seguir a ${userToUnfollow.username}` });
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
