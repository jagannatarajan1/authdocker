import catcher from "../utils/catcher.js";
import User from "../models/UserModel.js";
import jwt from "../utils/jwt.js";
import UserService from "../services/UserService.js";
import logger from "../configs/loggers.js";
import createUser from "../utils/createUser.js";
import { sendOtpSMS, sendResetSMS } from "../helpers/sendSms.js";

import sendPasswordEmailV2 from "../helpers/sendPasswordEmailv2.js";
import sendResetPasswordEmailV2 from "../helpers/sendResetPasswordEmailv2.js";

const Authcontroller = {
  signup: catcher(async (req, res) => {
    try {
      const newUser = await createUser({ ...req.body });
      const tokens = await UserService.getTokens({
        ...newUser.toObject(),
        userId: newUser.userId,
      });
      return res.status(201).json({
        message: "User created successfully.",
        data: { ...tokens, userData: newUser },
      });
    } catch (error) {
      return res.status(409).json({ message: error.message });
    }
  }),

  clientLogin: catcher(async (req, res) => {
    const { email, password } = req.body;

    const user = await UserService.getUser(email, ["customer"]);
    if (!user) {
      return res.status(401).json({ message: "Invalid User" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const userData = {
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
    };

    const { accessToken, refreshToken } = await UserService.getTokens({
      ...userData,
      userId: user.userId,
    });

    return res.json({
      message: "Login successful",
      data: { accessToken, refreshToken, userData },
    });
  }),

  adminLogin: catcher(async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { email, password } = req.body;

    const user = await UserService.getUser(email, ["admin"]);
    if (!user) {
      return res.status(401).json({ message: "Invalid User" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const userData = {
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
      isActive: user.isActive,
    };

    const { accessToken, refreshToken } = await UserService.getTokens({
      ...userData,
      userId: user.userId,
    });

    return res.json({
      message: "Login successful",
      data: { accessToken, refreshToken, userData },
    });
  }),
  refreshToken: catcher(async (req, res) => {
    const oldRefreshToken = req.headers["refresh-token"];
    const decodedToken = jwt.decodeToken(oldRefreshToken);
    if (!decodedToken || decodedToken.token !== "refresh_token") {
      logger.error("Invalid Refresh Token");
      return res.status(401).json({ message: "Invalid Request" });
    }
    const user = await UserService.getUser(decodedToken.user.email, [
      "customer",
      "admin",
    ]);
    if (!user) {
      logger.error("Invalid User");
      return res.status(401).json({ message: "Invalid Request" });
    }
    const isRefreshTokenValid = user.refreshTokens.includes(oldRefreshToken);
    if (!isRefreshTokenValid) {
      logger.error("Invalid Refresh Token");
      return res.status(401).json({ message: "Invalid Request" });
    }
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== oldRefreshToken
    );
    await user.save();

    const userData = {
      email: user.email,
      role: user.role,
      name: user.name,
      isActive: user.isActive,
    };

    const { accessToken, refreshToken } = await UserService.getTokens({
      ...userData,
      userId: user.userId,
    });

    return res.json({
      message: "Refresh token verified successfully",
      data: { accessToken, refreshToken, userData },
    });
  }),
  fetchUserFromRequset: catcher(async (req, res, next) => {
    const { userId } = req.user;
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(401).json({ message: "Invalid User" });
    } else if (!user.isActive) {
      return res.status(401).json({ message: "User is not active" });
    } else {
      return res.json({ message: "User fetched", status: "success", user });
    }
  }),
  forgotPassword: catcher(async (req, res, next) => {
    const { email } = req.body;
    const user = await UserService.getUser(email, ["customer"]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 300000;
    await user.save();
    await sendResetPasswordEmailV2(email, otp);
    return res.json({ message: "OTP Sent your Email Successfully" });
  }),
  resetPassword: catcher(async (req, res, next) => {
    const { email, otp, password } = req.body;
    const user = await UserService.getUser(email, ["customer"]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(
      user.otp.toString(),
      otp.toString(),
      user.otpExpiry,
      Date.now()
    );
    if (user.otp.toString() !== otp.toString() || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    user.password = password;
    user.otp = "";
    user.otpExpiry = Date.now();
    await user.save();
    return res.json({ message: "Password Reset Successful" });
  }),

  sendOtp: catcher(async (req, res, next) => {
    const { phone } = req.body;
    const user = await UserService.getUserMobile(phone, ["customer", "admin"]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 300000;
    await user.save();
    await sendOtpSMS(phone, otp);
    return res.json({ message: "OTP sent to your phone Successfully" });
  }),

  otpLogin: catcher(async (req, res, next) => {
    const { phone, otp } = req.body;
    const user = await UserService.getUserMobile(phone, ["customer", "admin"]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.otp.toString() !== otp.toString() || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    user.otp = "";
    user.otpExpiry = Date.now();
    await user.save();
    const userData = {
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
    };

    const { accessToken, refreshToken } = await UserService.getTokens({
      ...userData,
      userId: user.userId,
    });

    return res.json({
      message: "Login successful",
      data: { accessToken, refreshToken, userData },
    });
  }),
  changePassword: catcher(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const userData = req.user;
    const user = await UserService.getUser(userData.email, ["customer"]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Old Password" });
    }
    user.password = newPassword;
    await user.save();
    return res.json({ message: "Password Changed Successfully" });
  }),
  me: catcher(async (req, res, next) => {
    const userData = req.user;
    let user = await UserService.getUserById(userData.userId);

    if (user.role === "customer") {
      user = {
        ...user._doc,
        centre: await Center.findOne({ centreId: user.centerId }),
      };
      user = {
        ...user,
        location: await Location.findOne({ locationId: user.locationId }),
      };
      user = { ...user, group: await Group.findOne({ groupId: user.groupId }) };
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ message: "User fetched", status: "success", user });
  }),

  googleLogin: catcher(async (req, res) => {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Missing authorization code" });
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({
        message:
          "Google OAuth configuration is missing. Please check environment variables.",
      });
    }

    try {
      // Exchange the authorization code for tokens
      const tokenResponse = await axios.post(
        "https://oauth2.googleapis.com/token",
        {
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: "postmessage",
          grant_type: "authorization_code",
        }
      );

      const { access_token, refresh_token, expires_in, scope } =
        tokenResponse.data;

      // Use the access token to fetch user information
      const userInfoResponse = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const { email, given_name, family_name, sub } = userInfoResponse.data;

      // Check if user already exists in the database
      let user = await UserService.getUser(email, ["customer", "admin"]);

      if (!user) {
        // If user doesn't exist, create a new user
        user = await createUser({
          email,
          firstName: given_name,
          lastName: family_name,
          googleId: sub,
          role: "customer", // Default role
          isActive: true,
        });
      }

      // Generate tokens for the user
      const userData = {
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      };

      const { accessToken, refreshToken } = await UserService.getTokens({
        ...userData,
        userId: user.userId,
      });

      return res.json({
        message: "Google account connected successfully",
        data: {
          accessToken,
          refreshToken,
          userData,
        },
      });
    } catch (error) {
      logger.error("Google OAuth error", error.response?.data || error.message);

      if (error.response?.data?.error) {
        return res.status(400).json({
          message: "Google OAuth failed",
          error: error.response.data.error,
          details: error.response.data.error_description,
        });
      }

      return res.status(500).json({
        message: "Internal server error while connecting Google account",
      });
    }
  }),
};

export default Authcontroller;
