import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';
import nodemailer from 'nodemailer';
import config from '../configs/config.js';
import logger from '../configs/loggers.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const templateSource = fs.readFileSync(path.join(__dirname, '../static/sendResetPasswordEmailTemplate.hbs'), 'utf-8');
const template = handlebars.compile(templateSource);

async function sendResetPasswordEmailV2(email, OTP) {
    logger.info(`Sending Reset password OTP email to ${email}`);
    const emailHtml = template({ OTP });

    // Configure the SMTP transporter
    let transporter = nodemailer.createTransport({
        host: config.mailHost, // SMTP host from config
        port: parseInt(config.mailPort), // SMTP port from config
        secure: config.mailEncryption === 'ssl', // Use SSL if specified
        auth: {
            user: config.smtpUser, // SMTP username
            pass: config.smtpPass  // SMTP password
        }
    });

    let mailOptions = {
        from: `"Vision Fund India" <${config.mailFromAddress}>`,
        to: email,
        subject: 'Welcome to Vision Fund - Reset Password OTP',
        text: `Welcome to Vision Fund!\n\nYour email ID: ${email}\nYour new password is: ${OTP}`,
        html: emailHtml,
        attachments: [
            {
                filename: 'email-banner.png',
                path: path.join(__dirname, '../static/email-banner.png'),
                cid: 'email-banner' // Use content ID to embed images in HTML
            },
            {
                filename: 'email-logo.png',
                path: path.join(__dirname, '../static/email-logo.png'),
                cid: 'email-logo'
            },
            {
                filename: 'apple.png',
                path: path.join(__dirname, '../static/apple.png'),
                cid: 'apple'
            },
            {
                filename: 'google.png',
                path: path.join(__dirname, '../static/google.png'),
                cid: 'google'
            }
        ]
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        logger.info(`Message sent: ${info.messageId}`);
    } catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
        throw error;
    }
}

export default sendResetPasswordEmailV2;
