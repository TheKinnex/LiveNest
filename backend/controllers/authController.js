
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import sendEmail from "../utils/sendEmail.js";
import { uploadImage } from "../utils/cloudinary.js";
import fs from 'fs-extra'

// @desc Registrar un nuevo usuario
// @route POST /auth/register
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    const { username, email, password } = req.body;

    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    // Crear una nueva instancia de usuario
    user = new User({ username, email, password });

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);


    // Verificar si el usuario esta subiendo una imagen
    if (req.files?.img) {
      
        const result = await uploadImage(req.files.img.tempFilePath, 'profilesImg')
        user.profilePicture = {
          public_id: result.public_id,
          secure_url: result.secure_url 
        }

        await fs.unlink(req.files.img.tempFilePath)
    }

    // Guardar el usuario en la base de datos
    await user.save();

    //enviamos una respuesta de éxito
    res.status(201).json({ msg: "Usuario registrado exitosamente. Por favor, inicie sesión para continuar." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Iniciar sesión
// @route POST /auth/login
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    // Comparar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Credenciales inválidas" });
    }

    // Crear token JWT
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Solicitar recuperación de contraseña
// @route POST /auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Generar un token de restablecimiento
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Enviar correo electrónico con el token
    const resetUrl = `${req.protocol}://${req.get("host")}/auth/reset-password/${resetToken}`;
    const message = `Recibiste este correo porque solicitaste restablecer la contraseña. Por favor, realiza un PUT a la siguiente URL: \n\n ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Recuperación de contraseña",
      message,
    });

    res.status(200).json({ msg: "Correo de recuperación enviado" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Restablecer la contraseña
// @route POST /auth/reset-password/:token
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ msg: "Token inválido o expirado" });
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.status(200).json({ msg: "Contraseña restablecida exitosamente" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};
