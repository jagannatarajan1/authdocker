import UserService from "../services/UserService.js";
import catcher from "../utils/catcher.js";

const UserController = {
    listCustomers: catcher(async (req, res) => {
    const customers = await UserService.getUsers('customer');
        return res.json({ data: customers });
    }),
    listEmployees: catcher(async (req, res) => {
        const employees = await UserService.getUsers('employee');
        return res.json({ data: employees });
    }),
    listInstructors: catcher(async (req, res) => {
        const instructors = await UserService.getUsers('instructor');
        return res.json({ data: instructors });
    }),
    getUser: catcher(async (req, res) => {
        const { id } = req.params;
        const user = await UserService.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({ data: user });
    }),
    updateCustomer: catcher(async (req, res) => {
        const { id } = req.params;
        const { firstName, lastName, externalId, centerId, groupId, locationId, phone, email } = req.body;
        const customer = await UserService.getUserById(id);
        if (!customer) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingUser = await UserService.getUser(email, ['customer', 'employee', 'admin', 'instructor']);
        if (existingUser && existingUser.userId != id) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const existingUserMobile = await UserService.getUserMobile(phone, ['customer', 'employee', 'admin', 'instructor']);
        if (existingUserMobile && existingUserMobile.userId != id) {
            return res.status(400).json({ message: 'Phone number is already in use' });
        }
        const updatedCustomer = await UserService.updateUser(id, { firstName, lastName, externalId, centerId, groupId, locationId, email, phone });
        return res.json({ message: 'User updated successfully'});
    }),
    updateEmployee: catcher(async (req, res) => {
        const { id } = req.params;
        const {  firstName, lastName, externalId, departmentId, designationId, branchId, phone, email } = req.body;

        const employee = await UserService.getUserById(id);
        if (!employee) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingUser = await UserService.getUser(email, ['customer', 'employee', 'admin', 'instructor']);
        if (existingUser && existingUser.userId != id) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const existingUserMobile = await UserService.getUserMobile(phone, ['customer', 'employee', 'admin', 'instructor']);
        if (existingUserMobile && existingUserMobile.userId != id) {
            return res.status(400).json({ message: 'Phone number is already in use' });
        }
        const updatedEmployee = await UserService.updateUser(id, {  firstName, lastName, externalId, departmentId, designationId, branchId, email, phone });
        return res.json({ message: 'User updated successfully'});
    }),
    updateInstructor: catcher(async (req, res) => {
        const { id } = req.params;
        const {  firstName, lastName, phone, email, departmentId, designationId, branchId } = req.body;
        const instructor = await UserService.getUserById(id);
        if (!instructor) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingUser = await UserService.getUser(email, ['customer', 'employee', 'admin', 'instructor']);
        if (existingUser && existingUser.userId != id) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const existingUserMobile = await UserService.getUserMobile(phone, ['customer', 'employee', 'admin', 'instructor']);
        if (existingUserMobile && existingUserMobile.userId != id) {
            return res.status(400).json({ message: 'Phone number is already in use' });
        }
        const updatedInstructor = await UserService.updateUser(id, {  firstName, lastName, email, phone, departmentId, designationId, branchId });
        return res.json({ message: 'User updated successfully'});
    }),
    deActivateUser: catcher(async (req, res) => {
        const { id } = req.params;
        const user = await UserService.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await UserService.updateUser(id, { isActive: false });
        return res.json({ message: 'User deactivated Successfully'});
    }),
    activateUser: catcher(async (req, res) => {
        const { id } = req.params;
        const user = await UserService.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await UserService.updateUser(id, { isActive: true });
        return res.json({ message: 'User activated Successfully'});
    }),
}

export default UserController;