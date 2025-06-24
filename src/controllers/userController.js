// import UserService from "../services/UserService.js";
import UserService from "../services/UserService.js";
import catcher from "../utils/catcher.js";

const UserController = {
  getUser: catcher(async (req, res) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ data: user });
  }),

  deActivateUser: catcher(async (req, res) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const updatedUser = await UserService.updateUser(id, { isActive: false });
    return res.json({ message: "User deactivated Successfully" });
  }),
  activateUser: catcher(async (req, res) => {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const updatedUser = await UserService.updateUser(id, { isActive: true });
    return res.json({ message: "User activated Successfully" });
  }),
};

export default UserController;
