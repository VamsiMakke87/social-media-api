const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


router.get("/", (req, res) => {
  res.send("Auth Route");
});

router.post("/register", async (req, res) => {
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
  !user && res.status(404).json({"message":"User Not Found!!"});

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (validPassword) {

      const token = jwt.sign(
        {id:user._id, email:user.email},
        process.env.JWT_SECRET,
        {expiresIn: "10h"}
      );

      res.status(200).json({token,"message":"Login Successfull","userId":user._id});
    } else {
      res.status(400).json({"message":"Invalid Password!!"});
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
