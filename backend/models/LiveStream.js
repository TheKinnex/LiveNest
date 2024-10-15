// models/LiveStream.js
import mongoose from "mongoose";

const liveStreamSchema = new mongoose.Schema({
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  streamKey: { type: String, required: true, unique: true },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  chatMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatMessage" }],
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isLive: { type: Boolean, default: false },
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

const LiveStream = mongoose.model("LiveStream", liveStreamSchema);
export default LiveStream;
