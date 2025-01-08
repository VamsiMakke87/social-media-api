const mongoose = require("mongoose");

const replySchema = mongoose.Schema(
  {
    userId: {
      type: String,
      max: 50,
      required: true,
    },
    description: {
      type: String,
      max: 100,
    },
    postId: {
      type: String,
      max: 50,
    },
    commentId: {
      type: String,
      max: 50,
    },
    commentUserId: {
      type: String,
      max: 50,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Replies", replySchema);
