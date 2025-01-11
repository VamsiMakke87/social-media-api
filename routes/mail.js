const router = require("express").Router();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

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
    const { userId } = req.body;
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
