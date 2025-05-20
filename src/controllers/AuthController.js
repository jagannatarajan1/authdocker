import catcher from "../utils/catcher.js";
import User from "../models/UserModel.js";
import jwt from "../utils/jwt.js";
import UserService from "../services/UserService.js";
import logger from "../configs/loggers.js";
import { generateRandomPassword } from "../helpers/constants.js";
import {sendOtpSMS, sendResetSMS} from "../helpers/sendSms.js";
import Center from "../models/CenterModel.js";
import Designation from "../models/DesignationModel.js";
import Branch from "../models/BranchModel.js";
import Department from "../models/DeptModel.js";
import Group from "../models/GroupModel.js";
import Location from "../models/LocationModel.js";
import sendPasswordEmailV2 from "../helpers/sendPasswordEmailv2.js";
import sendResetPasswordEmailV2 from "../helpers/sendResetPasswordEmailv2.js";

const Authcontroller = {
    clientLogin: catcher(async (req, res) => {
        const { email, password } = req.body;
        const user = await UserService.getUser(email, ['customer', 'employee']);
        if (!user) {
            return res.status(401).json({ message: 'Invalid User' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Password' });
        }

        const userData = {
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive
        };

        const {accessToken, refreshToken} = await UserService.getTokens({...userData, userId: user.userId});

        return res.json({ message: 'Login successful', data: {accessToken, refreshToken, userData} });
    }),
    adminLogin: catcher(async (req, res) => {
        const { email, password } = req.body;
        const user = await UserService.getUser(email, ['admin', 'instructor']);
        if (!user) {
            return res.status(401).json({ message: 'Invalid User' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Password' });
        }

        const userData = {
            email: user.email,
            role: user.role,
            name: user.firstName + ' ' + user.lastName,
            isActive: user.isActive
        };

        const {accessToken, refreshToken} =  await UserService.getTokens({...userData, userId: user.userId});


        return res.json({ message: 'Login successful', data: {accessToken, refreshToken, userData} });
    }),
    addCustomer: catcher(async (req, res) => {
        const { email, firstName, lastName, phone, externalId, centerId, groupId, locationId } = req.body;
        const password = generateRandomPassword();

        const existingUser = await UserService.getUser(email, ['customer', 'employee', 'admin', 'instructor']);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const existingUserMobile = await UserService.getUserMobile(phone, ['customer', 'employee', 'admin', 'instructor']);
        if (existingUserMobile) {
            return res.status(400).json({ message: 'Phone number is already in use' });
        }

        const newUser = new User({ email, password, role:"customer", firstName, lastName, phone, externalId, centerId, groupId, locationId });
        await newUser.save();

        await sendPasswordEmailV2(firstName + " " + lastName, email, password);

        return res.status(201).json({ message: 'User registered successfully' });
    }),
    addEmployee: catcher(async (req, res) => {
        const { email,  firstName, lastName, phone, externalId, departmentId, designationId, branchId } = req.body;

        const password = generateRandomPassword();

        const existingUser = await UserService.getUser(email, ['customer', 'employee', 'admin', 'instructor']);
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        const existingUserMobile = await UserService.getUserMobile(phone, ['customer', 'employee', 'admin', 'instructor']);
        if (existingUserMobile) {
            return res.status(400).json({ message: 'Phone number is already in use' });
        }

        const newUser = new User({ email, firstName, lastName, password, role: "employee", phone, externalId, departmentId, designationId, branchId });
        await newUser.save();

        await sendPasswordEmailV2(firstName + " " + lastName, email, password);

        return res.status(201).json({ message: 'User registered successfully' });
    }),
    addInstructor: catcher(async (req, res) => {
        const { email,  firstName, lastName, phone, departmentId, designationId, branchId } = req.body;

        const password = generateRandomPassword();

        const existingUser = await UserService.getUser(email, ['customer', 'employee', 'admin', 'instructor']);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const existingUserMobile = await UserService.getUserMobile(phone, ['customer', 'employee', 'admin', 'instructor']);
        if (existingUserMobile) {
            return res.status(400).json({ message: 'Phone number is already in use' });
        }

        const newUser = new User({ email, password, role:"instructor", firstName, lastName, phone, departmentId, designationId, branchId });
        await newUser.save();

        await sendPasswordEmailV2(firstName + " " + lastName, email, password);

        return res.status(201).json({ message: 'User registered successfully'})
    }),
    refreshToken: catcher(async (req, res) => {
        const oldRefreshToken = req.headers['refresh-token'];
        const decodedToken = jwt.decodeToken(oldRefreshToken);
        if (!decodedToken || decodedToken.token !== 'refresh_token') {
            logger.error('Invalid Refresh Token');
            return res.status(401).json({ message: 'Invalid Request' });
        }
        const user = await UserService.getUser(decodedToken.user.email, ['customer', 'employee', 'admin', 'instructor']);
        if (!user) {
            logger.error('Invalid User');
            return res.status(401).json({ message: 'Invalid Request' });
        }
        const isRefreshTokenValid = user.refreshTokens.includes(oldRefreshToken);
        if (!isRefreshTokenValid) {
            logger.error('Invalid Refresh Token');
            return res.status(401).json({ message: 'Invalid Request' });
        }
        user.refreshTokens = user.refreshTokens.filter(token => token !== oldRefreshToken);
        await user.save();

        const userData = {
            email: user.email,
            role: user.role,
            name: user.name,
            isActive: user.isActive
        };

        const {accessToken, refreshToken} =  await UserService.getTokens({...userData, userId: user.userId});

        return res.json({ message: 'Refresh token verified successfully', data: {accessToken, refreshToken, userData} });
    }),
    fetchUserFromRequset: catcher(async (req, res, next) => {
        const { userId } = req.user;
        const user = await User.findOne({userId});

        if (!user) {
            return res.status(401).json({ message: 'Invalid User' });
        }
        else if(!user.isActive){
            return res.status(401).json({ message: 'User is not active' });
        }
        else {
            return res.json({ message: 'User fetched', status: "success", user });
        }
    }),
    forgotPassword: catcher(async (req, res, next)=>{
        const { email } = req.body;
        const user = await UserService.getUser(email, ['customer', 'employee', 'admin', 'instructor']);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 300000;
        await user.save();
        await sendResetPasswordEmailV2(email, otp)
        return res.json({ message: 'OTP Sent your Email Successfully' });
    }),
    resetPassword: catcher(async (req, res, next)=>{
        const { email, otp, password } = req.body;
        const user = await UserService.getUser(email, ['customer', 'employee', 'admin', 'instructor']);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user.otp.toString(), otp.toString(), user.otpExpiry, Date.now())
        if (user.otp.toString() !== otp.toString() || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        user.password = password;
        user.otp = '';
        user.otpExpiry = Date.now();
        await user.save();
        return res.json({ message: 'Password Reset Successful' });
    }),

    forgotPasswordMobile: catcher(async (req, res, next)=>{
        const { phone } = req.body;
        const user = await UserService.getUserMobile(phone, ['customer', 'employee']);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 300000;
        await user.save();
        await sendResetSMS(phone, otp)
        return res.json({ message: 'OTP Sent your Phone Successfully' });
    }),
    resetPasswordMobile: catcher(async (req, res, next)=>{
        const { phone, otp, password } = req.body;
        const user = await UserService.getUserMobile(phone, ['customer', 'employee']);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.otp.toString() !== otp.toString() || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        user.password = password;
        user.otp = '';
        user.otpExpiry = Date.now();
        await user.save();
        return res.json({ message: 'Password Reset Successful' });
    }),
    sendOtp: catcher(async (req, res, next)=>{
        const { phone } = req.body;
        const user = await UserService.getUserMobile(phone, ['customer', 'employee', 'admin', 'instructor']);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 300000;
        await user.save();
        await sendOtpSMS(phone, otp);
        return res.json({ message: 'OTP sent to your phone Successfully' });
    }),

    otpLogin: catcher(async (req, res, next)=>{
        const { phone, otp } = req.body;
        const user = await UserService.getUserMobile(phone, ['customer', 'employee', 'admin', 'instructor']);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.otp.toString() !== otp.toString() || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        user.otp = '';
        user.otpExpiry = Date.now();
        await user.save();
        const userData = {
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive
        };

        const {accessToken, refreshToken} = await UserService.getTokens({...userData, userId: user.userId});

        return res.json({ message: 'Login successful', data: {accessToken, refreshToken, userData} });
    }),
    changePassword: catcher(async (req, res, next)=>{
        const { oldPassword, newPassword } = req.body;
        const userData = req.user
        const user = await UserService.getUser(userData.email, ['customer', 'employee', 'admin', 'instructor']);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Old Password' });
        }
        user.password = newPassword;
        await user.save();
        return res.json({ message: 'Password Changed Successfully' });
    }),
    me: catcher(async (req, res, next)=>{
        const userData = req.user;
        let user = await UserService.getUserById(userData.userId);

        if(user.role === 'customer'){
            user = { ...user._doc, centre: await Center.findOne({centreId: user.centerId})};
            user = { ...user, location: await Location.findOne({locationId: user.locationId})};
            user = { ...user, group: await Group.findOne({groupId: user.groupId})};
        } else if(user.role === 'employee'){
            user = { ...user._doc, departmentId: await Department.findOne({departmentId: user.departmentId})};
            user = {...user, designationId: await Designation.findOne({designationId: user.designationId})};
            user = {...user, branchId: await Branch.findOne({branchId: user.branchId})};
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({ message: 'User fetched', status: "success", user });
    })

}

export default Authcontroller;