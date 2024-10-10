// models/ChatMessage.js
import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  stream: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LiveStream",
    required: true,
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
  isDelete: {
    type: Boolean,
    default: false,
  },
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
module.exports = ChatMessage;
