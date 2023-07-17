const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const url = 'mongodb+srv://urujahmedsyed:beabat@cluster0.64q31qj.mongodb.net/resportal1';
const User = require('./models/usermodel');
const Img = require('./models/imagemodel');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const cookieParser = require('cookie-parser');

app.use(cors({
    origin: ["https://cancerclient.onrender.com", "http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(
    url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err) => {
        if (err) {
            console.log("error in connection");
        } else {
            console.log("mongodb is connected");
        }
    }
);

app.get("/", (req, res) => {
    return res.json({
        Mssg: "hwedsal"
    })
});

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        uname: req.body.uname,
        password: req.body.password,
    });
    if (user) {

        const token = jwt.sign(
            {
                uname: user.uname,
            },
            'secret123'
        );
        res.cookie('token', token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });
        return res.json({ status: 'ok', user: token });
    } else {
        return res.json({ status: 'error', user: false });
    }
});

app.post('/api/verify-otp', async (req, res) => {
  const { otp, email } = req.body;

  try {
    if (req.headers['x-otp-option'] === 'phone') {
      // Verify phone OTP
      // Use the phone number and OTP from req.body.phone and req.body.otp respectively
      // Add the necessary Firebase code here to verify the OTP via phone

      res.json({ status: 'verified' });
    } else {
      // Verify email OTP
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ status: 'error', message: 'Invalid OTP' });
      }

      // OTP verification successful
      user.otp = ''; // Clear OTP
      await user.save();

      res.json({ status: 'verified' });
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to verify OTP' });
  }
});



app.get('/api/user', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ status: 'error', message: 'Token not provided' });
        }
        const decoded = jwt.verify(token, 'secret123');
        const user = await User.findOne({ uname: decoded.uname });
        if (user) {
            return res.status(200).json({ status: 'ok', user: user.toObject() });
        } else {
            return res.status(404).json({ status: 'error', user: null });
        }
    } catch (err) {
        console.error('Error fetching user:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ status: 'error', message: 'Invalid token' });
        }
        return res.status(500).json({ status: 'error', user: null });
    }
});

app.post('/api/data', async (req, res) => {
    Img.find({}).then(val => {
        res.json({ code: 1, array: val });
    });
});

app.post('/api/signup', async (req, res) => {
    console.log(req.body);
    try {
        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            uname: req.body.uname,
            password: req.body.password,
            mobile: req.body.mobile,
            hospital: req.body.hospital,
            otp: otp
        });

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "breastcancerotpservice@gmail.com",
                pass: "gkeysjskrawyexgf",
            },
        });

        let mailOptions = {
            from: "breastcancerotpservice@gmail.com",
            to: req.body.email,
            subject: "Account Verification OTP",
            text: `Your OTP for account verification is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ status: 'yaya' });
    } catch (err) {
        res.json({ status: 'error', error: 'Duplicate username' });
    }
});

app.post('/api/image', async (req, res) => {
    try {
        const { image, result, ground, username, type } = req.body;
        const imgData = Buffer.from(image, 'base64');
        await Img.create({
            image: imgData,
            result,
            ground,
            username,
            type
        });
        res.json({ code: 1, message: 'Data uploaded successfully' });
    } catch (err) {
        res.json({ code: -1, message: 'Error uploading data' });
    }
});

app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

  try {
    if (req.headers['x-otp-option'] === 'phone') {
      // Send phone OTP
      // Use the phone number from req.body.phone and send the OTP using Firebase
      // Add the necessary Firebase code here to send the OTP via phone

      res.json({ status: 'ok', otp }); // Return the OTP for testing purposes
    } else {
      // Send email OTP
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "breastcancerotpservice@gmail.com",
          pass: "gkeysjskrawyexgf",
        },
      });

      let mailOptions = {
        from: "breastcancerotpservice@gmail.com",
        to: email,
        subject: "Account Verification OTP",
        text: `Your OTP for account verification is: ${otp}`,
      };

      await transporter.sendMail(mailOptions);

      res.json({ status: 'ok', otp });
    }
  } catch (err) {
    res.json({ status: 'error', error: 'Failed to send OTP' });
  }
});


app.listen(12345, () => {
    console.log('server started on port 12345');
});
