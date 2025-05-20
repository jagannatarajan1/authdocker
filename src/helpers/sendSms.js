import axios from 'axios';

// Constants
const API_TOKEN = '97ceb74c989ce95376c610a41e5fecf2';
const SENDER_ID = 'VFIIND'; // Replace with your registered sender ID
const BASE_URL = 'http://pay4sms.in/sendsms/';

/**
 * Sends an SMS using Pay4SMS with a specific template.
 * @param {string} phone - The recipient's phone number.
 * @param {string} templateId - The template ID for the SMS.
 * @param {Array<string>} variables - The dynamic variab;les to populate the template.
 */
export const sendSms = async (phone, message) => {
    // const encodedVariables = variables.map(encodeURIComponent).join('|'); // Encode and join variables
    const url = `${BASE_URL}?token=${API_TOKEN}&credit=2&sender=${SENDER_ID}&message=${message}&number=91${phone}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'success') {
            console.log('SMS sent successfully:', response.data);
        } else {
            console.error('Failed to send SMS:', response.data);
        }
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};

/**
 * Sends an OTP for login using the "Login with OTP" template.
 * @param {string} phone - The recipient's phone number.
 * @param {string} otp - The OTP to send.
 */
export const sendOtpSMS = async (phone, otp) => {
    const message = `Dear User, your one-time password (OTP) for secure login to your account is ${otp}. Please use this OTP to authenticate your access. The OTP will expire in 10 minutes. Regards, VisionFund India.`;
    await sendSms(phone, message);
};

/**
 * Sends an OTP for password reset using the "Forgot password EWV" template.
 * @param {string} phone - The recipient's phone number.
 * @param {string} otp - The OTP to send.
 */
export const sendResetSMS = async (phone, otp) => {
    const message = `Dear User, your OTP is ${otp} for forgot password. Please use this OTP to proceed. This OTP is valid for 10 minutes. Best regards, VisionFund India.`;
    await sendSms(phone, message);
};
