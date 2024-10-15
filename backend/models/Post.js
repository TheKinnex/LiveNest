import mongoose from "mongoose";


const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    maxlength: 500,
  },
  media: {
    type: [{
      public_id: String,
      secure_url: String
    }], // Lista de URLs para imágenes o videos
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
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
  }, tags: [{
    type: String, // Los tags serán de tipo cadena
    maxlength: 50, // Opcional: Limitar la longitud de cada tag
  }],
});

const Post = mongoose.model('Post', postSchema);
export default Post;
