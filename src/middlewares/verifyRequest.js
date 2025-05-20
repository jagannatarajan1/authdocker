import crypto from 'crypto';
import config from '../configs/config.js';
import logger from '../configs/loggers.js';


const decrypt = (encryptedData, key) => {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
};

const verifyRequest = (req, res, next) => {
    const appSecret = req.headers['x-app-secret'];
    const appId = req.headers['x-app-id'];
    const key = config.key;
    const rawAppSecret = config.appSecret; 

    if (!appSecret) {
        logger.error('AppSecret Missing');
        return res.status(401).json({ error: 'Invalid Request' });
    }
    if (!appId) {
        logger.error('AppId Missing');
        return res.status(401).json({ error: 'Invalid Request' });
    }

    logger.info(`AppId: ${appId}, AppSecret: ${appSecret}`);

    const decryptedAppSecret = decrypt(appSecret, key);

    if (decryptedAppSecret !== rawAppSecret) {
        logger.error('Invalid AppSecret');
        return res.status(401).json({ error: 'Invalid Request' });
    }
    next();
};

export default verifyRequest;
