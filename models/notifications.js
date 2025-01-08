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
      enum: [0, 1, 2, 3, 4, 5],
      /*
      0 - follow notificaiton
      1 - post like notification
      2 - post comment notificaiton
      3 - like comment notification
      4 - reply notification
      5 - like reply notification
      */
    },
    description:{
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", notificationsSchema);
