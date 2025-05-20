// this is login route file

import express from 'express';
import validateInput from '../middlewares/validate.js';
import AuthController from '../controllers/AuthController.js';
import { loginSchema, addCustomer, addEmployee, addInstructor, refreshTokenSchema } from '../validations/AuthValidation.js';
import verifyAdmin from '../middlewares/verifyAdmin.js';
import verifyRequest from '../middlewares/verifyRequest.js';
import verifyToken from '../middlewares/verifyToken.js';

const authRouter = express.Router();

authRouter.post('/login', validateInput(loginSchema), AuthController.clientLogin);
authRouter.post('/admin/login', validateInput(loginSchema), AuthController.adminLogin);

authRouter.post('/addCustomer', validateInput(addCustomer), verifyAdmin, AuthController.addCustomer);
authRouter.post('/addEmployee', validateInput(addEmployee), verifyAdmin, AuthController.addEmployee);
authRouter.post('/addInstructor', validateInput(addInstructor), verifyAdmin, AuthController.addInstructor);

authRouter.get('/verify', verifyRequest, verifyToken, AuthController.fetchUserFromRequset);
authRouter.get('/refresh', AuthController.refreshToken);
//add validation
authRouter.post('/sendOtp', AuthController.sendOtp);
authRouter.post('/otpLogin', AuthController.otpLogin);

authRouter.post('/forgotPassword', AuthController.forgotPassword);
authRouter.post('/resetPassword', AuthController.resetPassword);

authRouter.post('/forgotPasswordMobile', AuthController.forgotPasswordMobile);
authRouter.post('/resetPasswordMobile', AuthController.resetPasswordMobile);

authRouter.post('/changePassword', verifyToken, AuthController.changePassword);
authRouter.get('/me', verifyToken, AuthController.me);


// authRouter.post('/logout', AuthController.logout); 

export default authRouter;