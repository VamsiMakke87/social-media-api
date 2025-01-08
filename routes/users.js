const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Notifications = require("../models/notifications");
const path = require("path");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { route } = require("./auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${process.env.FILE_UPLOAD}/users`);
  },
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fieldSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileType = /jpg|jpeg|png/;
    const extension = fileType.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = fileType.test(file.mimetype);

    if (extension && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only.jpeg, .jpg and .png of max 2MB are allowed"));
    }
  },
});

router.get("/", (req, res) => {
  res.send("User Route");
});

//update profile pic
router.put("/profilepic", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(403).json("No file uploaded");
    }

    const filePath = path.join("./images/users", req.file.filename);

    const user = await User.findByIdAndUpdate(req.body.userId, {
      $set: { profilePic: "/" + filePath },
    });
    res.status(200).json("Profile updated Successfully");
  } catch (err) {
    return res.status(500).json(err.message);
  }
});

// Update User profile
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = bcrypt.genSalt(10);
        const hashedPassword = bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;
      } catch (err) {
        return res.send(500).json(err);
      }
    }

    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Profile updated Successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can only update your profile");
  }
});

//Delete user profile
router.delete("/:id", async (req, res) => {
  if (req.body.userId == req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Deleted Sucessfully");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can only delete your profile");
  }
});

// Search for users by username similarity
router.get("/search", async (req, res) => {
  console.log("here");
  const { username } = req.query;
  if (!username) {
    return res.status(400).json("Username query parameter is required");
  }

  try {
    const users = await User.find({
      username: { $regex: username, $options: "i" },
    }).limit(10);

    if (users.length > 0) {
      res.status(200).json(users);
    } else {
      res.status(404).json("No users found matching that username");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//Search for an account
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json("User Not Found");
  }
});

//follow a user
router.put("/follow/:id", async (req, res) => {
  try {
    const token = req.header("Authorization").substring(7);
    const payload = jwt.decode(token);
    if (payload.id != req.params.id) {
      const currUser = await User.findById(req.body.userId);
      const notificationData = {
        fromUserId: req.body.userId,
        toUserId: req.params.id,
        description: "followed you",
      };
      const newNotification = new Notifications(notificationData);
      const user = await User.findById(req.params.id);

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $push: { followers: req.body.userId },
          $set: { hasUnreadNotifications: true },
        });
        await currUser.updateOne({ $push: { following: req.params.id } });
        await newNotification.save();

        res.status(200).json("Follow Sucessfull");
      } else {
        res.status(403).json("You already follow this account");
      }
    } else {
      res.status(403).json("You cannot follow yourself");
    }
  } catch (err) {
    // console.log(err);
    res.status(500).json(err);
  }
});

// unfollow a user
router.put("/unfollow/:id", async (req, res) => {
  try {
    if (req.body.userId != req.params.id) {
      const user = await User.findById(req.params.id);
      const currUser = await User.findById(req.body.userId);
      // console.log(user.foll)
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currUser.updateOne({ $pull: { following: req.params.id } });
        res.status(200).json("Unfollow Sucessfull");
      } else {
        res.status(403).json("You do not follow this user");
      }
    } else {
      res.status(403).json("You cannot unfollow yourself");
    }
  } catch (err) {
    // console.log(err);
    res.status(500).json(err);
  }
});

//get user notifications
router.get("/notifications/:id", async (req, res) => {
  try {
    const token = req.header("Authorization").substring(7);
    const payload = jwt.decode(token);

    if (payload.id === req.params.id) {
      const notifications = await Notifications.find({
        toUserId: req.params.id,
      });
      notifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      res.status(200).json(notifications);
    } else {
      res.status(403).json({ message: "You can only view your notifications" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// read all notifications
router.put("/readNotifications", async (req, res) => {
  try {
    const token = req.header("Authorization").substring(7);
    const payload = jwt.decode(token);

    if(payload.id===req.body.userId){
      const user= await User.findByIdAndUpdate(req.body.userId,{
        $set : {hasUnreadNotifications: false}
      });

      res.status(200).json('message','Read all notifications');

    }else{
      res.status(403).json({'message':'Operation not allowed'});
    }

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
