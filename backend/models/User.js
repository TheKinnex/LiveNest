// models/User.js
import mongoose from "mongoose";
import crypto from "crypto"; 

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, "is invalid"],
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    public_id: String,
    secure_url: String 
  },
  bio: {
    type: String,
    maxlength: 150,
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  // Suscripciones realizadas por el usuario
  subscriptions: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
  ],
  streamKey: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(16).toString("hex"), // Actualización aquí
  },
  isStreaming: {
    type: Boolean,
    default: false,
  },
  moderatedStreams: [
    { type: mongoose.Schema.Types.ObjectId, ref: "LiveStream" },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false, 
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    required: function() {
      return !this.isVerified;
    }
  }
});

// Exportar el modelo como `default`
const User = mongoose.model("User", userSchema);
export default User;
