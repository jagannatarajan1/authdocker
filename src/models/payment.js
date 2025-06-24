import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    receipt: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    amount_due: {
      type: Number,
      required: true,
    },
    entity: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const payment_db = mongoose.model("Payment", paymentSchema); // Use PascalCase
export default payment_db;
