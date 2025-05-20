import jwt from 'jsonwebtoken';
import config from '../configs/config.js';

const generateToken = (payload, expiry='24h') => {

    const token = jwt.sign(payload, config.jwt_secret, {
        expiresIn: expiry,
    });

    return token;
};

const decodeToken = (token) => {
    return jwt.decode(token);
};



export default {
    generateToken,
    decodeToken
}