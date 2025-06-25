import UserService from "../services/UserService.js";
import User from "../models/UserModel.js";
const createUser = async ({
  name,
  email,
  password,
  phone,
  role = "customer", // Default to "customer" if not provided
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
      name,
      email,
      phone,
      password,
      role: "customer",
      isActive: true,
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
    throw error;
  }
};

export default createUser;
