import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/config.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";
import suscriptionRoutes from "./routes/suscriptionRoutes.js";
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";
import jwt from "jsonwebtoken";

dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Configura correctamente los orígenes permitidos en producción
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  })
);

// Middleware para compartir la instancia de io con todas las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/auth", authRoutes);
app.use("/profile", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/admin", adminRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);
app.use("/payments", paymentsRoutes);
app.use("/suscription", suscriptionRoutes);

const PORT = process.env.PORT || 5000;

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Acceso no autorizado. Token no proporcionado."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.user.id; // Asigna el ID del usuario autenticado al socket
    next(); // Continúa si la verificación del token es correcta
  } catch (err) {
    return next(new Error("Acceso no autorizado. Token inválido."));
  }
});


// Manejo de eventos con socket.io
io.on("connection", (socket) => {
  console.log(`Usuario ${socket.userId} se ha conectado con el socket: ${socket.id}`);

  // Unirse a una sala de conversación
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Usuario ${socket.userId} se unió a la sala: ${conversationId}`);
  });

  // Abandonar una sala de conversación cuando el usuario lo solicita
  socket.on("leaveConversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`Usuario ${socket.userId} ha dejado la sala: ${conversationId}`);
  });

  // Escuchar cuando un usuario envía un mensaje
  socket.on("sendMessage", async ({ conversationId, content }) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return;
      }

      // Crear el nuevo mensaje
      const newMessage = new Message({
        conversation: conversationId,
        sender: socket.userId, // Usar el ID del usuario del socket
        content,
      });

      // Guardar el mensaje en la base de datos
      const savedMessage = await newMessage.save();

      // Añadir el mensaje a la conversación
      conversation.messages.push(savedMessage._id);
      await conversation.save();

      // Emitir el mensaje a todos los usuarios conectados a esa conversación
      io.to(conversationId).emit("receiveMessage", savedMessage);
    } catch (err) {
      console.error("Error enviando el mensaje:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Usuario ${socket.userId} se ha desconectado`);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
