import jwt from 'jsonwebtoken';
import config from '../configs/config.js';
import logger from '../configs/loggers.js';

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Invalid Request' });
    }

    jwt.verify(token, config.jwt_secret, (err, decoded) => {
        if (err) {
            logger.error('Token Error', err);
            return res.status(403).json({ message: 'Invalid Request' });
        }
        req.user = decoded.user;
        next();
    });
};

export default verifyToken;