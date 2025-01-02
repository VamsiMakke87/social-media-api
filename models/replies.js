const mongoose = require("mongoose");

const replySchema = mongoose.Schema(
  {
    userId: {
      type: String,
      max: 50,
    },
    profileImage:{
      type: String
    },
    description: {
      type: String,
      max: 100,
    },
    commentId:{
        type: String,
        max: 50
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Replies", replySchema);
