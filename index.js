const express = require('express');
const app=express();
const cors=require('cors');
const mongoose=require('mongoose');
const url='mongodb+srv://urujahmedsyed:beabat@cluster0.64q31qj.mongodb.net/resportal1';
const User=require('./models/usermodel');
const Img=require('./models/imagemodel');
const jwt=require('jsonwebtoken');
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
// const multer = require('multer');
// const upload = multer().single('image');
// 'image' is the name of the input element in the HTML form
const cookieParser = require('cookie-parser');
const collName = 'images';


app.use(cors({
    origin:["https://cancerclient.onrender.com","http://localhost:5000"],
    methods:["GET","POST"],
    credentials: true}))
app.use(express.json())
app.use(cookieParser())

// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
//   });

mongoose.connect(
    url,
    { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
    },(err) => {
    if (err) {
    console.log("error in connection");
    } else {
    console.log("mongodb is connected");
    }}
);

app.get("/",(req,res)=>{
    return res.json({
        Mssg:"hwedsal"
    })
})

app.post('/api/login', async (req,res)=>{
    const user = await User.findOne({
        uname: req.body.uname,
        password: req.body.password,
    })
    if(user){

        const token=jwt.sign(
            {
                uname: user.uname,
            },
            //enter a java web token that will get encrypted and authorized
            //for the name from the given database we will take a status called ok and the token is returned, if its an error then false is returned
            'secret123'
        );
        // Set the token as a cookie
        res.cookie('token', token, {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours (adjust the expiration time as needed)
            httpOnly: true, // Cookie cannot be accessed by client-side JavaScript
            secure: true, // Cookie will be sent over HTTPS only (requires secure connection)
            sameSite: 'strict', // Cookie will be sent only for same-site requests
        });
        // console.log(token)
        return res.json({status:'ok',user:token})
    } else{
        return res.json({status:'error',user:false})
    }
});

app.get('/api/user', async (req, res) => {
  try {
    const token = req.headers.authorization; // Retrieve the token from the request headers
    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmFtZSI6InVydWphaG1lZHN5ZWQiLCJpYXQiOjE2ODkyMzIzNTd9.GhhrdzIGRItUjlCmdH7O7XDRcG4L1I6M0Pt6w6jDb04";
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Token not provided' });
    }
    const decoded = jwt.verify(token, 'secret123'); // Verify the token using the secret
    const user = await User.findOne({ uname: decoded.uname });
    if (user) {
      return res.status(200).json({ status: 'ok', user: user.toObject() }); // Convert the user object to plain JavaScript object
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
        // console.log(val);
    });

});


app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

  try {
      // Create a transporter
      let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: "breastcancerotpservice@gmail.com",
              pass: "gkeysjskrawyexgf",
          },
      });

      // Define the email options
      let mailOptions = {
          from: "breastcancerotpservice@gmail.com",
          to: email,
          subject: "Account Verification OTP",
          text: `Your OTP for account verification is: ${otp}`,
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      res.json({ status: 'ok' });
  } catch(err) {
      res.json({ status: 'error', error: 'Failed to send OTP' });
  }
});

app.post('/api/signup', async (req, res) => {
  console.log(req.body);
  try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email });

      if (user) {
          if (user.otp === otp) {
              // Correct OTP
              // Create the user account
              // ... (existing code for creating user account)

              // Delete the OTP from the user object
              await User.updateOne({ email }, { otp: null });

              res.json({ status: 'yaya' });
          } else {
              // Incorrect OTP
              res.json({ status: 'error', error: 'Invalid OTP' });
          }
      } else {
          res.json({ status: 'error', error: 'User not found' });
      }
  } catch(err) {
      res.json({ status: 'error', error: 'Failed to create user account' });
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
  

  app.listen(12345,()=>{
    console.log('server started on port 12345')
    });


// app.post('/api/images', async (req,res)=>{
//     console.log(req.body)
//     try{
//         const user = await User.create({
//             image: req.body.image,
//             result: req.body.result,
//             ground: req.body.ground,
//             username: req.body.username,
//             type: req.body.type,
//         })
//         res.json({status:'yaya'})
//     } catch(err){
//         res.json({status:'error',error:'mistake in life'})
//     }
// });

// app.post('/api/images', upload, async (req, res) => {
//     const { result, ground, username, type } = req.body;
//     const img = req.file.buffer; // the uploaded file buffer
//     const imgType = req.file.mimetype;
    
//     try {
//         const result = await Img.create({ img, result, ground, username, imgType });
//         return res.json({ status: 'ok', result });
//     } catch (err) {
//         return res.json({ status: 'error', error: err.message });
//     }
// });


