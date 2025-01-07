const router = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const Reply = require("../models/replies");

// Add a reply
router.post("/", async (req, res) => {
  const newReply = new Reply(req.body);

  try {
    // console.log(req.params.cmntId);
    const comment = await Comment.findById(req.body.commentId);
    const data = await newReply.save();
    await comment.updateOne({ $push: { replies: data._doc._id } });

    res.status(200).json(data);
  } catch (err) {
    // console.log(err);
    res.status(500).json(err);
  }
});

// Update a reply
router.put("/:id", async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (reply.userId === req.body.userId) {
      await reply.updateOne({ description: req.body.description });

      res.status(200).json("Reply Updated");
    } else {
      res.status(403).json("Cannot edit others comments");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete a reply
router.delete("/:id", async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    if (reply.userId === req.body.userId) {
      const comment = Comment.findById(req.body.commentId);
      await comment.updateOne({ $pull: { replies: reply._id } });
      await reply.deleteOne();

      res.status(200).json("Comment deleted");
    } else {
      res.status(403).json("Cannot delete others comments");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like or unlike a reply
router.put("/like/:id", async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);

    if (!reply.likes.includes(req.body.userId)) {
      await reply.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Liked Sucessfully");
    } else {
      await reply.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Unliked Sucessfully");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Fetch comment replies
router.get("/all/:id", async (req, res) => {
  try {
    const replies = await Reply.find({ commentId: req.params.id });
    replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const updatedReplies = await Promise.all(replies.map(async (reply) => {
      const replyData= reply.toObject();
      const user=await  User.findById(replyData.userId);
      replyData.username=user.username;
      replyData.profilePic=user.profilePic;
      return replyData;
    }));

    return res.status(200).json(updatedReplies);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
