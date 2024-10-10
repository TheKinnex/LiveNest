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
    type: String,
    default: "",
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
  // Suscripciones realizadas por el usuario a otros canales
  subscriptions: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
  ],
  // Usuarios que se han suscrito al canal de este usuario
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subscription" }],
  streamKey: {
    type: String,
    unique: true,
    default: () => require("crypto").randomBytes(16).toString("hex"),
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
    default: false
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
