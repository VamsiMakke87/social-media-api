const router = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const Reply = require("../models/replies");

// Create a comment
router.post("/", async (req, res) => {
  const newComment = new Comment(req.body);

  try {
    const post = await Post.findById(req.body.postId);
    const data = await newComment.save();
    console.log(data);
    await post.updateOne({ $push: { comments: data._doc._id } });

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Update a comment
router.put("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (comment.userId === req.body.userId) {
      await comment.updateOne({ description: req.body.description });

      res.status(200).json("Comment Updated");
    } else {
      res.status(403).json("Cannot edit others comments");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete a comment
router.delete("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (comment.userId === req.body.userId) {
      const post = Post.findById(req.body.postId);
      await post.updateOne({ $pull: { comments: comment._id } });
      await comment.deleteOne();

      res.status(200).json("Comment deleted");
    } else {
      res.status(403).json("Cannot delete others comments");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like or unlike a comment
router.put("/like/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    // console.log(typeof(post.likes)+";"+post.userId);

    if (!comment.likes.includes(req.body.userId)) {
      await comment.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Liked Sucessfully");
    } else {
      await comment.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Unliked Sucessfully");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Fetch posts comments
router.get("/all/:id", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id });
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const updatedComments = await Promise.all(
      comments.map(async (comment) => {
        const cmnt = comment.toObject();
        const user = await User.findById(cmnt.userId);
        cmnt.username = user.username;
        cmnt.profilePic = user.profilePic;
        return cmnt;
      })
    );

    return res.status(200).json(updatedComments);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
