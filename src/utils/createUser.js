const createUser = async ({
  firstName,
  lastName,
  email,
  password,
  phone,
  role,
}) => {
  const existingUser = await UserService.getUser(email, ["customer", "admin"]);
  if (existingUser) {
    throw new Error("User already exists.");
  }
  const newUser = new User({
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
    isActive: true,
  });
  await newUser.save();
  return newUser;
};
export default createUser;
