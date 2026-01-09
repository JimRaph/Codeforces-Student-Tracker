import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
import Student from '../models/Student.js';

dotenv.config()


const INACTIVITY_DAYS = 7;

//Sends reminder emails to students who have been inactive for a specified number of days

async function sendInactivityReminders() {
  const cutoffDate = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000);

  const inactiveStudents = await Student.find({
    reminderDisabled: false,
    $or: [
      { lastSubmissionDate: { $lt: cutoffDate } },
      { lastSubmissionDate: null }, // never submitted
    ],
  });

  if (inactiveStudents.length === 0) {
    console.log('No inactive students found for reminders.');
    return;
  }

  // Configure your email transporter (example with Gmail SMTP)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS, // your email password or app password
    },
  });

  for (const student of inactiveStudents) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'j.others.name@gmail.com',
        subject: 'Reminder: Get back to problem solving on Codeforces!',
        text: `Hi ${student.name},\n\nWe noticed you haven't submitted any problems in the last ${INACTIVITY_DAYS} days. Keep up the great work by solving more problems!\n\nBest,\nYour Coding Team`,
      };

      await transporter.sendMail(mailOptions);

      student.reminderCount = (student.reminderCount || 0) + 1;
      await student.save();

      console.log(`Sent reminder email to ${student.name} (${student.email})`);
    } catch (err) {
      console.error(`Failed to send email to ${student.email}:`, err);
    }
  }
}

sendInactivityReminders()

export default sendInactivityReminders
