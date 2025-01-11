const router = require("express").Router();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

let mailTransporter = null;

const initMail = () => {
  mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.APP_PASSWORD,
    },
  });
};

router.post("/sendMail", async (req, res) => {
  try {
    initMail();
    const { to, subject, text } = req.body;

    const mailOptions = {
      from: `"Social Media App" ${process.env.MAIL_ID}`,
      to,
      subject,
      text,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    res.status(200).json(info);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/sendActivationLink", async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email: email });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const data = await sendActivationMail(user.email, user.username, token);

    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
});

const sendActivationMail = async (email, username, token) => {
  try {
    initMail();

    const mailOptions = {
      from: `"Social Media App" ${process.env.MAIL_ID}`,
      to: email,
      subject: "Account activation link",
      html: `
      <html>
      <body>
        <div>Hi ${username},</div>
        <div>Click this <a href="${process.env.FRONTEND_URL}/activate/${token}">link</a> to activate your account</div>
      </body>
      </html>
      `,
    };

    const res = await mailTransporter.sendMail(mailOptions);

    return res;
  } catch (err) {
    console.log(err);
  }
};

module.exports = router;
