const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  res.send("Auth Route");
});

router.post("/signup", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const appUser = new User({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
    });
    const userData = await appUser.save();
    res.status(200).json(userData);
  } catch (err) {
    console.log(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json({ message: "User Not Found!!" });

    if (!user.isActivated)
      res.status(403).json({ message: "Account not activated" });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (validPassword) {
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "10h" }
      );

      res
        .status(200)
        .json({ token, message: "Login Successfull", userId: user._id });
    } else {
      res.status(400).json({ message: "Invalid Password!!" });
    }
  } catch (err) {
    console.log(err);
  }
});

router.put("/activate", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).send("Missing activation token.");
    const decoded = jwt.decoded(token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(400).json({ message: "Activation link expired" });
    }
    const user = User.findById(decoded.userId);
    if(!user){
      return res.status(404).json({message: "User not found"});
    }
    if(user.isActivated){
      return res.status(400).json({message: "Account already activated"});
    }
    user.isActivated=true;
    await user.save();
    res.status(200).json({message:"Account successfully activated"});
  } catch (err) {
    res.status(500).json(err);
  }
});



//if username or email already exists
router.get("/exists", async (req, res) => {
  try {
    const username = req.query.username;
    const email = req.query.email;

    const query = {};
    if (username) query.username = username;
    if (email) query.email = email;

    const user = await User.findOne(query);

    res.status(200).json({ isExists: user !== null });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
