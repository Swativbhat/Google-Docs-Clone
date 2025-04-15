const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendWelcomeEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Docs Clone',
      html: `<h1>Welcome ${name}!</h1><p>Thank you for signing up to Docs Clone.</p>`
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

exports.sendShareEmail = async ({ emails, message, documentId, documentTitle, senderName }) => {
  try {
    const shareLink = `${process.env.BASE_URL}/documents/${documentId}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emails.join(','),
      subject: `${senderName} shared a document with you`,
      html: `
        <h1>${senderName} has shared a document with you</h1>
        <p><strong>Document:</strong> ${documentTitle}</p>
        <p><strong>Message:</strong> ${message || 'No message provided'}</p>
        <p>Click <a href="${shareLink}">here</a> to access the document.</p>
        <p>Or copy this link: ${shareLink}</p>
      `
    });
  } catch (error) {
    console.error('Error sending share email:', error);
    throw error;
  }
};

