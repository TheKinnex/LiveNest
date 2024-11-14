import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/config.js";
import jwt from "jsonwebtoken";
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
import User from "./models/User.js";

dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
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
app.use("/subscriptions", suscriptionRoutes);


app.use((req, res, next) => {
  res.status(404).json({ msg: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 5000;

// Middleware de autenticación para Socket.io
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

// Definir constantes para eventos
const EVENTS = {
  JOIN_CONVERSATION: "joinConversation",
  LEAVE_CONVERSATION: "leaveConversation",
  SEND_MESSAGE: "sendMessage",
  RECEIVE_MESSAGE: "receiveMessage",
  NEW_CONVERSATION: "newConversation",
  UPDATE_CONVERSATION: "updateConversation",
  CHECK_ONLINE_STATUS: "checkOnlineStatus",
  ONLINE_STATUS: "onlineStatus",
  ERROR: "error",
};

// Manejo de eventos con Socket.io
io.on("connection", (socket) => {

  // Unirse a la sala propia
  socket.join(socket.userId);

  // Manejar unirse a una conversación
  socket.on(EVENTS.JOIN_CONVERSATION, async (conversationId) => {
    try {
      // Verificar que la conversación existe y que el usuario es parte de ella
      const conversation = await Conversation.findById(conversationId).populate('users', '_id');
      if (!conversation) {
        socket.emit(EVENTS.ERROR, "Conversación no encontrada.");
        return;
      }

      const isParticipant = conversation.users.some(user => String(user._id) === String(socket.userId));
      if (!isParticipant) {
        socket.emit(EVENTS.ERROR, "No estás autorizado para unirte a esta conversación.");
        return;
      }

      socket.join(conversationId);
    } catch (err) {
      socket.emit(EVENTS.ERROR, "Error al unirse a la conversación.");
    }
  });

  // Manejar abandonar una conversación
  socket.on(EVENTS.LEAVE_CONVERSATION, (conversationId) => {
    socket.leave(conversationId);
  });

  // Manejar enviar un mensaje
  socket.on(EVENTS.SEND_MESSAGE, async ({ conversationId, content }) => {
    if (!conversationId || !content || typeof content !== 'string' || content.trim().length === 0) {
      socket.emit(EVENTS.ERROR, "Mensaje inválido.");
      return;
    }

    try {
      // Verificar que la conversación existe y que el usuario es parte de ella
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        socket.emit(EVENTS.ERROR, "Conversación no encontrada.");
        return;
      }

      const isParticipant = conversation.users.some(user => String(user._id) === String(socket.userId));
      if (!isParticipant) {
        socket.emit(EVENTS.ERROR, "No estás autorizado para enviar mensajes en esta conversación.");
        return;
      }

      // Sanitizar y limitar el contenido del mensaje
      const sanitizedContent = content.trim().substring(0, 1000); // Limita a 1000 caracteres

      // Crear el nuevo mensaje
      const newMessage = new Message({
        conversation: conversationId,
        sender: socket.userId,
        content: sanitizedContent,
      });

      // Guardar el mensaje en la base de datos
      const savedMessage = await newMessage.save();

      // Añadir el mensaje a la conversación
      conversation.messages.push(savedMessage._id);
      await conversation.save();

      // Obtener el username del remitente
      const sender = await User.findById(socket.userId).select("username");
      if (!sender) {
        console.warn(`Usuario con ID ${socket.userId} no encontrado.`);
      }

      // Emitir el mensaje a todos los usuarios en la conversación
      const messageToEmit = {
        _id: savedMessage._id,
        content: savedMessage.content,
        createdAt: savedMessage.createdAt,
        sender: {
          _id: socket.userId,
          username: sender ? sender.username : "Usuario",
        },
      };

      io.to(conversationId).emit(EVENTS.RECEIVE_MESSAGE, messageToEmit);
    } catch (err) {
      console.error("Error enviando el mensaje:", err.message);
      socket.emit(EVENTS.ERROR, "Error al enviar el mensaje.");
    }
  });

  /* Manejar verificar el estado en línea
  socket.on(EVENTS.CHECK_ONLINE_STATUS, async (userIdToCheck) => {
    try {
      const isOnline = io.sockets.adapter.rooms.has(userIdToCheck);
      socket.emit(EVENTS.ONLINE_STATUS, { userId: userIdToCheck, isOnline });
    } catch (err) {
      console.error("Error al verificar el estado en línea:", err.message);
      socket.emit(EVENTS.ERROR, "Error al verificar el estado en línea.");
    }
  }); */

  // Manejar eventos de nuevas conversaciones en tiempo real
  socket.on(EVENTS.NEW_CONVERSATION, (newConversation) => {
    const userId = socket.userId;
    const conversationExists = conversations.some(
      (convo) => String(convo._id) === String(newConversation._id)
    );
    if (!conversationExists) {
      const otherUsers = newConversation.users.filter(user => String(user._id) !== String(userId));
      const formattedConversation = { ...newConversation, otherUsers };
      setConversations((prevConversations) => [...prevConversations, formattedConversation]);
    }
  });

  // Manejar actualizaciones de conversaciones en tiempo real
  socket.on(EVENTS.UPDATE_CONVERSATION, (updatedConversation) => {
    const userId = socket.userId;
    const otherUsers = updatedConversation.users.filter(user => String(user._id) !== String(userId));
    const updatedConvo = { ...updatedConversation, otherUsers };

    setConversations((prevConversations) =>
      prevConversations.map((convo) =>
        String(convo._id) === String(updatedConvo._id) ? updatedConvo : convo
      )
    );
  });
  
  // Manejar desconexión
  socket.on("disconnect", () => {
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
