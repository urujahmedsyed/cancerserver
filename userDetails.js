const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    uname: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    hospital: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
  },
  {
    collection: "UserInfo",
  }
);

mongoose.model("UserInfo", userDetailsSchema);
