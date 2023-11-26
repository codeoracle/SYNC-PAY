const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.forwardemail.net",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASSWORD, 
    },
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/`
  const message = `You are receiving this email because you (or someone else) has requested the reset of the password. Please click on the following link to complete the process: ${resetUrl}`;
    
   
     

  // Define the email options
  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to,
    subject: 'Password Reset Request',
    text: message,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
