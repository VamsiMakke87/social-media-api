const router = require("express").Router();
require("dotenv").config();
const Post = require("../models/post");
const User = require("../models/user");
const Notification = require("../models/notifications");
const path = require("path");
const multer = require("multer");
const crypto= require('crypto');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");


const randomImageName=  (bytes=32)=>{
  return crypto.randomBytes(bytes).toString('hex');
}

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
  },
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.env.FILE_UPLOAD}/posts`);
  },
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileType = /jpg|jpeg|png/;
    const extension = fileType.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mime = fileType.test(file.mimetype);
    if (extension && mime) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .jpeg, .png file upto 2MB are accepted."));
    }
  },
});

const storage2 = multer.memoryStorage();

const upload2 = multer({ storage: storage2 });

// Create a post
router.post("/", upload.single("file"), async (req, res) => {
  const { userId, description } = req.body;
  const data = { userId, description };
  if (req.file) {
    const imagePath = path.join("./images/posts", req.file.filename);
    data.image = "/" + imagePath;
  }
  const newPost = new Post(data);

  try {
    const post = await newPost.save();
    res.status(200).json("Posted Sucessfully");
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//upload file to S3
router.post("/uploadS3", upload2.single("image"), async (req, res) => {
  try {


    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: randomImageName(),
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    const data = await s3.send(command);

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json(`${err}`);
  }
});

// get a post
router.get("/:id", async (req, res) => {
  try {
    const postById = await Post.findById(req.params.id);
    const post = postById.toObject();
    const user = await User.findById(post.userId);
    post.username = user.username;
    post.profilePic = user.profilePic;

    return res.status(200).json(post);
  } catch (err) {
    console.log(err);
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
      if (req.body.userId != post.userId) {
        const notificationData = {
          fromUserId: req.body.userId,
          toUserId: post.userId,
          postId: post._id,
          type: 1,
        };
        const newNotification = new Notification(notificationData);
        await newNotification.save();
        await User.findByIdAndUpdate(post.userId, {
          $set: { hasUnreadNotifications: true },
        });
      }
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
    const updatedFriendPosts = friendPosts.map((post) => {
      const ps = post.toObject();
      ps.username = user.username;
      ps.profilePic = user.profilePic;
      return ps;
    });

    return res.status(200).json(updatedFriendPosts);
  } catch (err) {
    // console.log(err);
    res.status(500).json(err);
  }
});

//file test
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      res.status(403).json("No file uploaded");
    }

    const filePath = path.join("./images/posts", req.file.filename);

    res.status(200).json(filePath);
  } catch (err) {
    res.status(500).json("Upload Failed");
  }
});

module.exports = router;
