const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      max: 50,
      required: true
    },
    description: {
      type: String,
      required:true,
      minlength: 1,
      maxlength: 50,
    },
    postId: {
      type: String,
      max: 50
    },
    likes: {
      type: Array,
      default: [],
    },
    replies:{
        type: Array,
        default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
