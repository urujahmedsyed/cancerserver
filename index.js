const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");
const User = require("./models/usermodel");
const Otp = require("./models/otpmodel");

app.use(
  cors({
    origin: ["https://cancerclient.onrender.com", "http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

mongoose.connect(
  "mongodb+srv://urujahmedsyed:beabat@cluster0.64q31qj.mongodb.net/resportal1",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log("error in connection");
    } else {
      console.log("mongodb is connected");
    }
  }
);

const otp = speakeasy.totp({
  secret: speakeasy.generateSecret().base32,
  digits: 6,
  window: 1,
});

app.post("/api/signup", async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.create({
      name: req.body.name,
      uname: req.body.uname,
      password: req.body.password,
      mobile: req.body.mobile,
      hospital: req.body.hospital,
    });

    let transporter = nodemailer.createTransport({
      service:'gmail',
      auth: {
          user: 'bc.predict@gmail.com',
          pass: 'xqfrpccrckwgcipp'
      },
      tls:{
          rejectUnauthorized:false
      }
  });

    let mailOptions = {
      from: '"Breast Cancer Prediction" <bc.predict@gmail.com>',
      to: req.body.email,
      subject: "Account Verification",
      text: `You have recently created an account with us.\nYour Verification OTP is ${otp}\nIf you haven't made an account please contact the site administrator.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({ status: "yaya" });
  } catch (err) {
    res.json({ status: "error", error: "Duplicate username" });
  }
});

app.post("/api/sendOtp", async (req, res) => {
  const { email, phone } = req.body;

  const otpEntry = new Otp({
    email,
    otp,
  });

  try {
    await otpEntry.save();

    let transporter = nodemailer.createTransport({
      service:'gmail',
      auth: {
          user: 'bc.predict@gmail.com',
          pass: 'xqfrpccrckwgcipp'
      },
    });

    let mailOptions = {
      from: "bc.predict@gmail.com", // Replace with your email
      to: email,
      subject: "OTP Verification",
      text: `Your Verification OTP is ${otp}\nIf you haven't made an account please contact the site administrator.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({ status: "true" });
  } catch (error) {
    console.log(error);
    res.json({ status: "false" });
  }
});

app.post("/api/verify", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpEntry = await Otp.findOne({ email });

    if (otpEntry && otpEntry.otp === otp) {
      res.status(201).json({ status: "true" });
    } else {
      res.status(201).json({ status: "false" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "false" });
  }
});

app.listen(12345, () => {
  console.log("server started on port 12345");
});
