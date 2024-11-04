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
      return res
        .status(400)
        .json({ msg: "El correo ya está vinculado a una cuenta" });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: "Este username ya está ocupado" });
    }

    // Generar el código de verificación
    const verificationCode = crypto.randomBytes(3).toString("hex"); // Código de 6 caracteres

    // Crear una nueva instancia de usuario
    user = new User({
      username,
      email,
      password,
      verificationCode, // Guardar el código de verificación
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

    // Construir la URL de verificación
    const verificationUrl = `${process.env.FRONT_URL}/verify?code=${verificationCode}&email=${email}`;

    // Enviar el correo con la URL de verificación
    const message = `Gracias por registrarte. Por favor, verifica tu cuenta haciendo clic en el siguiente enlace: \n\n ${verificationUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Verificación de cuenta",
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
// @route GET /auth/verify
export const verifyUser = async (req, res) => {
  const { email, code } = req.query; // Obtener el email y el código de la URL

  try {
    // Buscar al usuario por correo
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Verificar si el código de verificación es correcto
    if (user.verificationCode !== code) {
      return res.status(400).json({ msg: "Código de verificación inválido" });
    }

    // Activar la cuenta
    user.isVerified = true;
    user.verificationCode = undefined; // Eliminar el código de verificación después de usarlo
    await user.save();

    res.status(200).json({
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
        role: user.role
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
      return res.status(404).json({ msg: "No encontramos una cuenta con ese correo electrónico." });
    }

    // Generar un token de restablecimiento
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Enviar correo electrónico con el token
    const resetUrl = `${process.env.FRONT_URL}/reset-password/${resetToken}`;

    const message = `
      ¡Hola ${user.username}!

      Recibiste este correo porque solicitaste restablecer tu contraseña.

      Por favor, haz clic en el siguiente enlace o pégalo en tu navegador para continuar:

      ${resetUrl}

      Este enlace expirará en una hora. Si no solicitaste este cambio, puedes ignorar este correo.

      ¡Gracias!
    `;

    await sendEmail({
      email: user.email,
      subject: "Restablece tu contraseña en LiveNest",
      message,
    });

    res.status(200).json({ msg: "Te enviamos un correo electrónico con instrucciones para restablecer tu contraseña." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Hubo un error en el servidor.");
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
      return res.status(400).json({ msg: "Este enlace de restablecimiento es inválido o ha expirado." });
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.status(200).json({ msg: "Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña." });
  } catch (err) {
    console.error(err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ msg: "Este enlace de restablecimiento ha expirado. Por favor, solicita uno nuevo." });
    }
    res.status(400).json({ msg: "Este enlace de restablecimiento es inválido." });
  }
};

