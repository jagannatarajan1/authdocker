import config from "../configs/config.js";
import Razorpay from "razorpay";
const razorpayInstance = new Razorpay({
  key_id: config.razorpayKey,
  key_secret: config.razorpaySecret,

  // key_id: "rzp_test_6cPTvouJkkM4t2",
  // key_secret: "ua5YIEVs66NBthNxmMFshYDk",
});

export default razorpayInstance;
