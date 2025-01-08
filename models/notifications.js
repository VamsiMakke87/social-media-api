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
    type: {
      type: Number,
      enum: [0, 1, 2, 3],
      /*
      0 - follow notificaiton
      1 - like notification
      2 - comment notificaiton
      3 - reply notification
      */
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", notificationsSchema);
