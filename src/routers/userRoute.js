import express from 'express';
import verifyAdmin from '../middlewares/verifyAdmin.js';
import { deActivateUser, getUser, updateCustomer, updateEmployee, updateInstructor } from '../validations/AuthValidation.js';
import UserController from '../controllers/userController.js';
import validateInput from '../middlewares/validate.js';

const userRouter = express.Router();

userRouter.get('/listCustomers', verifyAdmin, UserController.listCustomers);
userRouter.get('/listEmployees', verifyAdmin, UserController.listEmployees);
userRouter.get('/listInstructors', verifyAdmin, UserController.listInstructors);
userRouter.get('/getUser/:id', verifyAdmin, validateInput(getUser, ['params']), UserController.getUser);
userRouter.put('/updateCustomer/:id', verifyAdmin, validateInput(updateCustomer), UserController.updateCustomer);
userRouter.put('/updateEmployee/:id', verifyAdmin, validateInput(updateEmployee), UserController.updateEmployee);
userRouter.put('/updateInstructor/:id', verifyAdmin, validateInput(updateInstructor), UserController.updateInstructor);
userRouter.get('/deactivateUser/:id', verifyAdmin, validateInput(deActivateUser, ['params']), UserController.deActivateUser);
userRouter.get('/activateUser/:id', verifyAdmin, validateInput(deActivateUser, ['params']), UserController.activateUser);



export default userRouter;