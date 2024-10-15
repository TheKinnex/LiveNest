import mongoose from "mongoose";


/*
  Ideas: Grupos
*/
const conversationSchema = new mongoose.Schema({
  // Array de usuarios participantes en la conversación
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  // Array de IDs de los mensajes de la conversación
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
  ],
  // Indicador de si uno de los participantes ha silenciado la conversación
  isMuted: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
