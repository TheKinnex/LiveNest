import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

// @desc Crear una nueva conversación
// @route POST /conversations
export const createConversation = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || userId === req.user.id) {
      const msg = !userId
        ? "Debes proporcionar un ID de usuario"
        : "No puedes iniciar una conversación contigo mismo";
      return res.status(400).json({ msg });
    }

    // Verificar si ya existe una conversación
    let conversation = await Conversation.findOne({
      users: { $all: [req.user.id, userId] },
    });

    if (conversation) {
      return res.status(400).json({ msg: "La conversación ya existe" });
    }

    // Crear la conversación
    conversation = new Conversation({
      users: [req.user.id, userId],
      messages: [],
    });

    await conversation.save();

    // Poblar los usuarios en la conversación
    conversation = await Conversation.findById(conversation._id).populate("users", "username profilePicture");

    // Emitir el evento de nueva conversación a ambos usuarios
    req.io.to(req.user.id).emit("newConversation", conversation);
    req.io.to(userId).emit("newConversation", conversation);

    res.status(201).json({ msg: "Conversación creada", conversation });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Obtener todas las conversaciones de un usuario
// @route GET /conversations
export const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      users: { $in: [req.user.id] },
      isDeleted: false,
    })
      .populate("users", "username profilePicture")
      .populate({
        path: "messages",
        select: "content sender createdAt",
        options: { sort: { createdAt: -1 }, limit: 1 }, // Obtener solo el último mensaje
      });

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Obtener información de una conversación específica por ID
// @route GET /conversations/:id
export const getConversationById = async (req, res) => {
  try {
    const conversationId = req.params.id;

    // Buscar la conversación por ID
    const conversation = await Conversation.findById(conversationId)
      .populate("users", "username profilePicture") // Obtener los usuarios en la conversación
      .populate({
        path: "messages",
        select: "content sender createdAt",
        options: { sort: { createdAt: -1 } }, // Obtener mensajes ordenados por la fecha de creación
      });

    // Verificar si la conversación existe
    if (!conversation) {
      return res.status(404).json({ msg: "Conversación no encontrada" });
    }

    res.json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};
