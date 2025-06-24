import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "../utils/jwt.js";
import { USER_ROLE_ENUM } from "../helpers/constants.js";
import config from "../configs/config.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      trim: true,
      enum: USER_ROLE_ENUM,
      required: true,
    },
    phone: {
      type: String,
      minlength: 10,
      maxlength: 10,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokens: {
      type: Array,
      default: [],
    },
    otp: {
      type: String,
      default: "",
    },
    otpExpiry: {
      type: Date,
      default: Date.now,
    },
    isSubscribed: { type: Boolean, default: false },
    subscriptionExpiresAt: { type: Date },
  },
  {
    timestamps: true, // This automatically manages createdAt and updatedAt
  }
);
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password using the salt
    this.password = await bcrypt.hash(this.password, salt);

    next(); // Continue the save process
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }
});
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.JwtToken = async function () {
  const user = this;
  console.log(user);
  const token = jwt.sign({ id: user._id }, config.jwt_secret, {
    expiresIn: "1d", // expires in 24 hours
  });
  return token;
};
const User = mongoose.model("User", userSchema);

export default User;
