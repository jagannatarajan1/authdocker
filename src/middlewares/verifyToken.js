import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import config from "../configs/config.js";
import logger from "../configs/loggers.js";

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Invalid Request: Missing or malformed token" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token);
    const decoded = jwt.verify(token, config.jwt_secret);
    console.log("Decoded Token Payload:", decoded);

    if (!decoded || !decoded.user || !decoded.user.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(decoded.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error("Token Verification Error", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }

    return res
      .status(403)
      .json({ message: err.message || "Token verification failed" });
  }
};

export default verifyToken;
