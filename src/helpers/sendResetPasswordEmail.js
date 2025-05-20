import nodemailer from 'nodemailer';
import config from '../configs/config.js';
import logger from '../configs/loggers.js';

async function sendResetPasswordEmail(email, OTP) {
    logger.info(`Sending Reset password otp email to ${email}`);
    logger.info(`SMTP User: ${config.smtpUser}`);
    // Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service
        auth: {
            user: config.smtpUser, // Your email address
            pass: config.smtpPass  // Your email password
        }
    });

    // Setup email data
    let mailOptions = {
        from: `"Vision Fund India" ${config.smtpUser}`, // Sender address
        to: email, // List of receivers
        subject: 'OTP for Vision Fund - Reset Password', // Subject line
        text: `Welcome to Vision Fund!\n\nYour OTP to reset your password is: ${OTP}`, // Plain text body
        html: `
            <h1>Welcome to Vision Fund!</h1>
            <p>Did you Forgot your Password?</p>
            <p>The OTP to reset your password is: <b>${OTP}</b></p>
            <p>Please keep this information secure and do not share it with anyone.</p>
            <p>This OTP is valid only for 5 minutes.</p>
        `
    };

    let info = await transporter.sendMail(mailOptions);

    logger.info(`Message sent: ${info.messageId}`);

}

export default sendResetPasswordEmail;