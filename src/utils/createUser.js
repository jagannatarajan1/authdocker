import UserService from "../services/UserService.js";
import User from "../models/UserModel.js";
const createUser = async ({
  Name,
  // lastName,
  email,
  password,
  phone,
  role,
}) => {
  // Check for existing email
  const existingEmail = await UserService.getUser(email, ["customer", "admin"]);
  if (existingEmail) {
    throw new Error("Email is already in use.");
  }

  // Check for existing phone
  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    throw new Error("Phone number is already in use.");
  }

  // Create new user
  try {
    const newUser = new User({
      Name,
      // lastName,
      email,
      phone,
      password,
      role,
      isActive: true,
      // isSubscribed: false,
      // subscriptionExpiresAt: null,
    });
    await newUser.save();
    return newUser;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      throw new Error(
        `${
          duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)
        } is already in use.`
      );
    }
    throw error; // Re-throw other errors
  }
};

export default createUser;
