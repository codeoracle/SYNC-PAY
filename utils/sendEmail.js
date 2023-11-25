const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.forwardemail.net",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASSWORD, 
    },
  });

  // Define the email options
  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to,
    subject,
    text,
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
