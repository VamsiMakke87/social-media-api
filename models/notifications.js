const mongoose = require("mongoose");

const notificationsSchema = mongoose.Schema(
  {
    fromUserId: {
      type: String,
      max: 50,
      required: true,
    },
    toUserId: {
      type: String,
      max: 50,
      required: true,
    },
    postId: {
      type: String,
      max: 50,
    },
    commentId: {
      type: String,
      max: 50,
    },
    replyId: {
      type: String,
      max: 50,
    },
    description: {
      type: String,
      max: 50,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", notificationsSchema);
