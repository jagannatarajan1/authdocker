// const Razorpay = require("razorpay");

// import Razorpay from "razorpay";

// var instance = new Razorpay({
//   RAZORPAY_KEY: process.env.RAZORPAY_KEY,
//   RAZORPAY_SECRET: process.env.RAZORPAY_SECRET,
// });

// module.exports = instance;

import config from "../configs/config.js";
import Razorpay from "razorpay";
// RAZORPAY_KEY = "rzp_test_6cPTvouJkkM4t2";
// RAZORPAY_SECRET = "ua5YIEVs66NBthNxmMFshYDk";
const razorpayInstance = new Razorpay({
  // RAZORPAY_KEY: config.razorpayKey,
  // RAZORPAY_SECRET: config.razorpaySecret,

  key_id: "rzp_test_6cPTvouJkkM4t2",
  key_secret: "ua5YIEVs66NBthNxmMFshYDk",
});

export default razorpayInstance;
