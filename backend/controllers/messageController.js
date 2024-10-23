import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

// @desc Enviar un mensaje
// @route POST /message/:conversationId/send
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    // Validar que el contenido no esté vacío
    if (!content || content.length > 500) {
      return res
        .status(400)
        .json({ msg: "El mensaje debe tener menos de 500 caracteres." });
    }

    // Verificar si la conversación existe
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: "Conversación no encontrada" });
    }

    // Crear el nuevo mensaje
    const newMessage = new Message({
      conversation: req.params.conversationId,
      sender: req.user.id,
      content,
    });

    // Guardar el mensaje en la base de datos
    const savedMessage = await newMessage.save();

    // Añadir el mensaje a la conversación
    conversation.messages.push(savedMessage._id);
    await conversation.save();

    // Obtener el username del remitente
    const sender = await User.findById(req.user.id).select("username");

    // Emitir el mensaje al frontend a través de socket.io
    req.io.to(req.params.conversationId).emit("receiveMessage", {
      content: savedMessage.content,
      createdAt: savedMessage.createdAt,
      sender: {
        username: sender.username, // Incluimos el username del remitente
      },
    });

    res.status(201).json({ msg: "Mensaje enviado", message: savedMessage });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Obtener mensajes de una conversación
// @route GET /message/:conversationId/
export const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(
      req.params.conversationId
    ).populate({
      path: "messages",
      match: { isDelete: false },
      populate: { path: "sender", select: "username profilePicture" },
    });

    if (!conversation) {
      return res.status(404).json({ msg: "Conversación no encontrada" });
    }

    res.json(conversation.messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};
