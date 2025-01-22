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

router.post("/sendActivationLink", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isActivated)
      return res
        .status(403)
        .json({ message: "Account already activated, Please login" });

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
        <div>This link is only valid for 1 hour</div>
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

router.post("/sendForgotPasswordLink", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isActivated) {
      return res.status(400).json({
        message: "Account not activated. Please activate your account",
      });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const data = await sendForgotPasswordMail(user.email, user.username, token);

    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
});

const sendForgotPasswordMail = async (email, username, token) => {
  try {
    initMail();

    const mailOptions = {
      from: `"Social Media App" ${process.env.MAIL_ID}`,
      to: email,
      subject: "Reset Password Request",
      html: `
        <html>
        <body>
          <div>Hi ${username},</div>
          <div>Click this <a href="${process.env.FRONTEND_URL}/forgotpassword/${token}">link</a> to reset your password</div>
          <div>This link is only valid for 1 hour</div>
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

router.post("/sendLoginOTP", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const data = await sendOTPMail(user.email, user.username, otp);

    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
});

const sendOTPMail = async (email, username, otp) => {
  try {
    initMail();

    const mailOptions = {
      from: `"Social Media App" ${process.env.MAIL_ID}`,
      to: email,
      subject: "OTP Request",
      html: `
        <html>
        <body>
          <div>Hi ${username},</div>
          <div>Enter this one-time password to login to your account.</div>
          <h1>${otp}</h1>
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
