// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Configurar el transporte de correo
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Opciones de correo
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Enviar el correo
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
