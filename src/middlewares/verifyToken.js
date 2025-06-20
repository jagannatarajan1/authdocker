import jwt from "jsonwebtoken";
import config from "../configs/config.js";
import logger from "../configs/loggers.js";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Invalid Request: Missing or malformed token" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after 'Bearer'
  console.log("Token:", token);

  jwt.verify(token, config.jwt_secret, (err, decoded) => {
    if (err) {
      logger.error("Token Verification Error", err.message); // Log specific error
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Invalid token" });
      }
      return res.status(403).json({ message: "Token verification failed" });
    }

    req.user = decoded.user; // Attach decoded user to request
    next();
  });
};

export default verifyToken;
