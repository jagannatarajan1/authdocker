import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { USER_ROLE_ENUM } from "../helpers/constants.js";

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
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
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

const User = mongoose.model("User", userSchema);

export default User;
