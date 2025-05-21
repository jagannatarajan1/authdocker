import express from "express";
import verifyAdmin from "../middlewares/verifyAdmin.js";
import { deActivateUser, getUser } from "../validations/AuthValidation.js";
import UserController from "../controllers/userController.js";
import validateInput from "../middlewares/validate.js";

const userRouter = express.Router();

userRouter.get(
  "/getUser/:id",
  verifyAdmin,
  validateInput(getUser, ["params"]),
  UserController.getUser
);

userRouter.get(
  "/deactivateUser/:id",
  verifyAdmin,
  validateInput(deActivateUser, ["params"]),
  UserController.deActivateUser
);
userRouter.get(
  "/activateUser/:id",
  verifyAdmin,
  validateInput(deActivateUser, ["params"]),
  UserController.activateUser
);

export default userRouter;
