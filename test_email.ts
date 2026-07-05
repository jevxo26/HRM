import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function run() {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'My App'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: 'info@jevxo.com', // Sending to self for test
      subject: "Test SMTP",
      text: "Test email",
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
}

run();
