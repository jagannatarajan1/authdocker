import express from "express";
// const { userAuth } = require("../middlewares/auth");
import razorpayInstance from "../utils/razorpayInstance.js";
import payment_db from "../models/payment.js";
import config from "../configs/config.js";
import User from "../models/UserModel.js";
import verifyToken from "../middlewares/verifyToken.js";
// import userAuth from "../middlewares/auth.js";
// const razorpayInstance = require("../utils/razorpayInstance");
// const paymentSchema = require("../models/payment");
// const {
//   validateWebhookSignature,
// } = require("razorpay/dist/utils/razorpay-utils.js");

import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";

const paymentRoutes = express.Router();

// const { findOne } = require("../models/user");
paymentRoutes.post("/create", verifyToken, async (req, res) => {
  try {
    console.log("Received request to create payment", req.user);
    const { _id } = req.user;
    console.log("User ID:", _id);
    console.log("Request body:", req.body);

    const { price } = req.body;
    console.log(price);
    console.log("Request body:", req.body);
    console.log(config.razorpayKey);
    console.log("Razorpay Key:", config.razorpayKey);

    const razorpayKey = config.razorpayKey;
    const payment = await razorpayInstance.orders.create({
      amount: price, // Amount in paise
      currency: "INR",
      receipt: "receipt#1",
    });

    console.log("Payment created:", payment);

    // Save the payment details in your database
    const newPayment = new payment_db({
      orderId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      notes: payment.notes,
      status: payment.status,
      userId: _id,
      entity: payment.entity,
      amount_due: payment.amount_due,
      receipt: payment.receipt,
      attempts: payment.attempts,
    });

    try {
      await newPayment.save();
      console.log("✅ Payment saved to DB:", newPayment);
    } catch (err) {
      console.error("❌ Error saving payment:", err.message);
      if (err.name === "ValidationError") {
        console.error("Validation details:", err.errors);
      }
    }

    console.log("New payment saved:", newPayment);

    // Send the response to the client after saving
    res.status(201).json({
      message: "Payment created successfully",
      newPayment,
      razorpayKey,
    });
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

paymentRoutes.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook Called");
    const webhookSignature = req.get("X-Razorpay-Signature");
    console.log("Webhook Signature", webhookSignature);

    // Log raw body and signature
    // Validate the webhook signature
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      config.webhookSecret
    );

    if (!isWebhookValid) {
      console.log("INvalid Webhook Signature");
      return res.status(400).json({ msg: "Webhook signature is invalid" });
    }
    console.log("Valid Webhook Signature");

    const paymentDetails = req.body.payload.payment.entity;

    const orderId = paymentDetails.order_id;
    const paymentRecord = await payment_db.findOne({ orderId });
    console.log("Payment Record:", paymentRecord);

    if (!paymentRecord) {
      console.warn("⚠️ Payment record not found for orderId:", orderId);
      return res.status(404).send("Payment not found");
    }

    // Update payment status
    paymentRecord.status = paymentDetails.status;
    await paymentRecord.save();
    console.log(
      `💾 Payment status updated for order ${orderId}: ${paymentDetails.status} ${paymentDetails.userId}`
    );

    // Update user's subscription if payment is successful
    if (paymentDetails.status === "captured") {
      const user = await User.findById({ _id: paymentRecord.userId });
      if (user) {
        user.isSubscribed = true;
        user.subscriptionExpiresAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        );
        await user.save();
        console.log(
          `🎉 User ${user.email} subscription activated until ${user.subscriptionExpiresAt}`
        );
      } else {
        console.warn(`⚠️ User not found for payment: ${paymentRecord.userId}`);
      }
    }

    res.status(200).send("Webhook handled successfully");
  } catch (err) {
    console.error("🚨 Error processing webhook:", err);
    res.status(500).send("Internal server error");
  }
});

paymentRoutes.get("/verify", verifyToken, async (req, res) => {
  try {
    const { _id } = req.user;
    console.log("User ID:", _id);

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isSubscribed) {
      console.log("User is subscribed");
      return res
        .status(200)
        .json({ message: "User is subscribed", isSubscribed: true });
    } else {
      console.log("User is not subscribed");
      return res
        .status(200)
        .json({ message: "User is not subscribed", isSubscribed: false });
    }
  } catch (err) {
    console.error("Error verifying user:", err);
    return res.status(500).json({ error: "Failed to verify user" });
  }
});

export default paymentRoutes;
