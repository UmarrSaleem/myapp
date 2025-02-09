// services/emailService.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com', // Replace with your email
            pass: 'your-email-password', // Replace with your email password
        },
    });

    const mailOptions = {
        from: 'your-email@gmail.com', // Sender email
        to: to,                       // Recipient email
        subject: subject,             // Email subject
        text: text,                   // Email body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (err) {
        console.error('Error sending email: ', err);
    }
};

module.exports = sendEmail;
