import express from "express";
// const { userAuth } = require("../middlewares/auth");
import razorpayInstance from "../utils/razorpayInstance.js";
import payment_db from "../models/payment.js";
import config from "../configs/config.js";
import verifyToken from "../middlewares/verifyToken.js";
// import userAuth from "../middlewares/auth.js";
// const razorpayInstance = require("../utils/razorpayInstance");
// const paymentSchema = require("../models/payment");
// const {
//   validateWebhookSignature,
// } = require("razorpay/dist/utils/razorpay-utils");

import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";

const paymentRoutes = express.Router();

// const { findOne } = require("../models/user");
paymentRoutes.post("/create", verifyToken, async (req, res) => {
  try {
    console.log("Received request to create payment", req.user);
    const { userId } = req.user;
    // const { price, type } = req.body;
    const price = 1000; // Example price in paise
    const type = "stand"; // Example type
    console.log("Request body:", req.body);
    console.log(config.razorpayKey);
    console.log("Razorpay Key:", config.razorpayKey);
    const { firstName, lastName, email } = req.body;
    console.log(
      "Creating payment for:",
      firstName,
      lastName,
      email,
      price,
      type
    );
    const razorpayKey = config.razorpayKey;
    const payment = await razorpayInstance.orders.create({
      amount: 100000, // Amount in paise
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
      userId: userId,
      entity: payment.entity,
      amount_due: payment.amount_due,
      receipt: payment.receipt,
      attempts: payment.attempts,
    });

    await newPayment.save();
    console.log("New payment saved:", newPayment);

    // Send the response to the client after saving
    res.status(201).json({
      message: "Payment created successfully",
      newPayment,
    });
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ error: "Failed to create payment" });
  }
});
paymentRoutes.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get["X-Razorpay-Signature"];
    const isWebHookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.webhook_Secret
    );
    if (!isWebHookValid) {
      return res.status(403).send("Invalid signature");
    }
    const paymentDetails = req.body.payload.payment.entity;
    const paymentId = paymentDetails.id;
    // const paymentSchema = await findOne({ orderId: paymentId });
    paymentSchema.status = paymentDetails.status;
    if (!paymentSchema) {
      return res.status(404).send("Payment not found");
    }
    await paymentSchema.save();
    res.status(200).send("Payment processed successfully");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});

// module.exports = paymentRoutes;

export default paymentRoutes;
