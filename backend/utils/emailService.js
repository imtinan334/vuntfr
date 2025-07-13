import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Debug: Log SMTP credentials to verify they are loaded
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS);

// Create transporter for Resend SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true, // true for port 465 (TLS)
    auth: {
      user: process.env.SMTP_USER || 'resend',
      pass: process.env.SMTP_PASS
    }
  });
};

export async function sendNotification(email) {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'VU Datesheet Notifier'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: '🎉 VU Exam Datesheet is Now Available!',
      text: `Dear VU Student,\n\nGreat news! The Virtual University exam datesheet has been officially announced and is now available online.\n\n📅 Check your datesheet at: ${process.env.DATESHEET_URL || 'https://datesheet.vu.edu.pk/'}\n\nImportant Notes:\n• Please check your specific exam schedule\n• Note down your exam dates and times\n• Prepare accordingly for your exams\n\nBest of luck with your exams!\n\nBest regards,\nVU Datesheet Notifier Team\n\n---\nThis is an automated notification. Please do not reply to this email.`,
      html: `<b>Dear VU Student,</b><br><br>Great news! The Virtual University exam datesheet has been officially announced and is now available online.<br><br><a href="${process.env.DATESHEET_URL || 'https://datesheet.vu.edu.pk/'}">Check your datesheet</a><br><br>Best regards,<br>VU Datesheet Notifier Team`
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`[${new Date().toISOString()}] ✅ Email sent successfully to ${email}`);
    console.log(`[${new Date().toISOString()}] Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Failed to send email to ${email}:`, error.message);
    return false;
  }
}

export async function sendBulkNotifications(emails) {
  console.log(`[${new Date().toISOString()}] 📧 Starting bulk email notification to ${emails.length} subscribers`);
  const results = {
    total: emails.length,
    successful: 0,
    failed: 0,
    failedEmails: []
  };
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    try {
      const success = await sendNotification(email);
      if (success) {
        results.successful++;
      } else {
        results.failed++;
        results.failedEmails.push(email);
      }
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error sending to ${email}:`, error.message);
      results.failed++;
      results.failedEmails.push(email);
    }
  }
  console.log(`[${new Date().toISOString()}] 📊 Bulk email results: ${results.successful}/${results.total} successful`);
  if (results.failed > 0) {
    console.error(`[${new Date().toISOString()}] Failed emails:`, results.failedEmails);
  }
  return results;
}

export async function testEmailConfig(testEmail) {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'VU Datesheet Notifier'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: testEmail,
      subject: '🧪 VU Datesheet Notifier - Test Email',
      text: `This is a test email from VU Datesheet Notifier.\n\nIf you received this email, the email configuration is working correctly.\n\nTimestamp: ${new Date().toISOString()}\n\nBest regards,\nVU Datesheet Notifier Team`,
      html: `<b>This is a test email from VU Datesheet Notifier.</b><br><br>If you received this email, the email configuration is working correctly.<br><br><b>Timestamp:</b> ${new Date().toISOString()}<br><br>Best regards,<br>VU Datesheet Notifier Team`
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`[${new Date().toISOString()}] ✅ Test email sent successfully to ${testEmail}`);
    console.log(`[${new Date().toISOString()}] Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Test email failed:`, error.message);
    return false;
  }
} 