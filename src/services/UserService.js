import User from "../models/UserModel.js";
import jwt from "../utils/jwt.js";

const UserService = {
    getUser: async (email, role) => {
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') }, role: { $in: role }, isActive: true });
        return user;
    },
    getUserMobile: async (phone, role) => {
        const user = await User.findOne({ phone, role: { $in: role }, isActive: true });
        return user;
    },
    getTokens: async (user) => {
        // Generate access token
        const accessToken = await UserService.generateToken('access_token', user, 24*30);

        // Generate refresh token
        const refreshToken = await UserService.generateToken('refresh_token', user, 24*100);

        // Store refresh token in the database
        await UserService.storeRefreshToken(user.userId, refreshToken);

        // Return the tokens
        return { accessToken, refreshToken };
    },

    generateToken: async (token, user, expiry) => {
        const accessTokenExpiry = new Date();
        accessTokenExpiry.setHours(accessTokenExpiry.getHours() + expiry); 

        return jwt.generateToken({ token, user, expiry: accessTokenExpiry });

    },

    storeRefreshToken: async (userId, refreshToken) => {
        // Store refresh token in the database logic here
        await User.updateOne({ userId }, { $push: { refreshTokens: refreshToken } });
    },
    getUsers: async (role) => {
        const users = await User.find({ role }).select(['-password', '-refreshTokens', '-_id', '-__v']);
        return users;
    },
    getUserById: async (id) => {
        const user = await User.findOne({userId: id}).select(['-password', '-refreshTokens', '-_id', '-__v']);
        return user;
    },
    updateUser: async (id, data) => {
        const user = await User.updateOne({userId: id}, data);
        return user;
    }
}

export default UserService;