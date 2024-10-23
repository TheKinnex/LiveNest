import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import sendEmail from "../utils/sendEmail.js";
import { uploadImage } from "../utils/cloudinary.js";
import dotenv from "dotenv";
import fs from "fs-extra";
import crypto from "crypto"; // Importar para generar el código de verificación

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

    // Generar el código de verificación
    const verificationCode = crypto.randomBytes(3).toString("hex"); // Código de 6 caracteres

    // Crear una nueva instancia de usuario
    user = new User({
      username,
      email,
      password,
      verificationCode, // Asegurarse de agregar el código aquí
    });

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Si se sube una imagen, subirla y guardarla
    if (req.files?.img) {
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

    // Guardar el usuario en la base de datos
    await user.save();

    // Enviar el correo con el código de verificación
    const message = `Tu código de verificación es: ${verificationCode}`;
    await sendEmail({
      email: user.email,
      subject: "Código de verificación",
      message,
    });

    res
      .status(201)
      .json({ msg: "Usuario registrado exitosamente. Verifique su correo." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Verificar el código de verificación y activar la cuenta
// @route POST /auth/verify
export const verifyUser = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    // Buscar al usuario por correo
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Verificar si el código de verificación es correcto
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ msg: "Código de verificación inválido" });
    }

    // Activar la cuenta
    user.isVerified = true;
    user.verificationCode = undefined; // Establecer en undefined
    await user.save();

    res
      .status(200)
      .json({
        msg: "Cuenta verificada exitosamente. Ahora puedes iniciar sesión.",
      });
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
      expiresIn: process.env.JWT_EXPIRES_IN, // Configurar correctamente la expiración
    });

    // Enviar el token correctamente en la respuesta
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
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
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Enviar correo electrónico con el token
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/auth/reset-password/${resetToken}`;

    /* 
    
    El mensaje deberia ser mas entendible para un usuario normal que no entienda de metodos Http
  
    */
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

/* 

En este controlador deberia estar controlado al menos un error y la posterior respuesta
por si el token esta expirado o es invalido para que el usuario se entere si perdio
validez su token

*/
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
