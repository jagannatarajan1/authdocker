import nodemailer from "nodemailer";
import config from "../configs/config.js";
import logger from "../configs/loggers.js";

async function sendPasswordEmail(email, password) {
  logger.info(`Sending password email to ${email}`);
  logger.info(`SMTP User: ${config.smtpUser}`);
  // Create a transporter object using SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail", // Use your email service
    auth: {
      user: config.smtpUser, // Your email address
      pass: config.smtpPass, // Your email password
    },
  });

  // Setup email data
  let mailOptions = {
    from: `"Markethack.ai India" ${config.smtpUser}`, // Sender address
    to: email, // List of receivers
    subject: "Welcome to Markethack.ai - Your New Password", // Subject line
    text: `Welcome to Markethack.ai!\n\nYour email ID: ${email}\nYour new password is: ${password}`, // Plain text body
    html: `
            <h1>Welcome to Markethack.ai!</h1>
            <p>Your email ID: <b>${email}</b></p>
            <p>Your new password is: <b>${password}</b></p>
            <p>Please keep this information secure and do not share it with anyone.</p>
        `,
  };

  let info = await transporter.sendMail(mailOptions);

  logger.info(`Message sent: ${info.messageId}`);
}

export default sendPasswordEmail;
