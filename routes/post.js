const router = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");

// Create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);

  try {
    const post = await newPost.save();
    res.status(200).json("Posted Sucessfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

//update post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post Updated");
    } else {
      res.status(403).json("Cannot edit other's post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Post deleted");
    } else {
      res.status(403).json("Cannot delete other's post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Like or unlike a post
router.put("/like/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // console.log(typeof(post.likes)+";"+post.userId);

    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Liked Sucessfully");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Unliked Sucessfully");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Fetch timeline posts
router.get("/feed/all/:id", async (req, res) => {
  try {
    const currUser = await User.findById(req.params.id);
    const currUserPost = await Post.find({ userId: req.params.id });
    const friendPosts = await Promise.all(
      currUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    // console.log(friendPosts[0]);
    for (const post of friendPosts) currUserPost.push(...post);
    currUserPost.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const updatedCurrUserPost = await Promise.all(
      currUserPost.map(async (postData) => {
        const ps = postData.toObject();
        const postUser = await User.findById(ps.userId);
        ps.username = postUser.username;
        ps.profilePic = postUser.profilePic;
        return ps;
      })
    );

    return res.status(200).json(updatedCurrUserPost);
  } catch (err) {
    // console.log(err);
    res.status(500).json(err);
  }
});

//timeline of specific user
router.get("/feed/:id", async (req, res) => {
  try {
    // const currUser= await User.findById(req.body.userId);
    // const currUserPost=await Post.find({userId: req.body.userId});
    // console.log(params)
    const user = await User.findById(req.params.id);
    const friendPosts = await Post.find({ userId: req.params.id });
    friendPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const updatedFriendPosts=friendPosts.map((post) => {
      const ps = post.toObject();
      ps.username = user.username;
      ps.profilePic=user.profilePic;
      return ps;
    });

    return res.status(200).json(updatedFriendPosts);
  } catch (err) {
    // console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
