import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isReviewed: { type: Boolean, default: false },
  isDelete: { type: Boolean, default: false },
});

const Report = mongoose.model("Report", reportSchema);
export default Report;
