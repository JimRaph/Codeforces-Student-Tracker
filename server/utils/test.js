import path from 'path'
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import nodemailer from 'nodemailer';


async function sendTestEmail() {

    console.log(process.env.PORT)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'enter your email', 
    subject: 'Test Email from Codeforces Sync Project',
    text: 'This is a test email to confirm email setup is working.',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent:', info.response);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

sendTestEmail();
