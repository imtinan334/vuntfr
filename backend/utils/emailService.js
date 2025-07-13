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
    },
    // Add connection timeout and retry settings
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100
  });
};

// Retry function with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`[${new Date().toISOString()}] Email attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export async function sendNotification(email) {
  try {
    const transporter = createTransporter();
    
    // Verify SMTP connection before sending
    await transporter.verify();
    
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'VU Datesheet Notifier'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: '🎉 VU Exam Datesheet is Now Available!',
      text: `Dear VU Student,\n\nGreat news! The Virtual University exam datesheet has been officially announced and is now available online.\n\n📅 Check your datesheet at: ${process.env.DATESHEET_URL || 'https://datesheet.vu.edu.pk/'}\n\nImportant Notes:\n• Please check your specific exam schedule\n• Note down your exam dates and times\n• Prepare accordingly for your exams\n\nBest of luck with your exams!\n\nBest regards,\nVU Datesheet Notifier Team\n\n---\nThis is an automated notification. Please do not reply to this email.`,
      html: `<b>Dear VU Student,</b><br><br>Great news! The Virtual University exam datesheet has been officially announced and is now available online.<br><br><a href="${process.env.DATESHEET_URL || 'https://datesheet.vu.edu.pk/'}">Check your datesheet</a><br><br>Best regards,<br>VU Datesheet Notifier Team`
    };
    
    const sendEmail = async () => {
      const info = await transporter.sendMail(mailOptions);
      return info;
    };
    
    const info = await retryWithBackoff(sendEmail);
    
    console.log(`[${new Date().toISOString()}] ✅ Email sent successfully to ${email}`);
    console.log(`[${new Date().toISOString()}] Message ID: ${info.messageId}`);
    
    // Close transporter to free up connections
    transporter.close();
    
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Failed to send email to ${email}:`, error.message);
    
    // Log specific error types for debugging
    if (error.code === 'EAUTH') {
      console.error('Authentication failed - check SMTP credentials');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection failed - check SMTP host/port');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('SMTP timeout - server might be overloaded');
    }
    
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
  
  // Process emails in batches to avoid overwhelming the SMTP server
  const batchSize = 10;
  const batches = [];
  
  for (let i = 0; i < emails.length; i += batchSize) {
    batches.push(emails.slice(i, i + batchSize));
  }
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`[${new Date().toISOString()}] Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} emails)`);
    
    // Process batch in parallel with limited concurrency
    const batchPromises = batch.map(async (email, index) => {
      try {
        // Add small delay between emails in the same batch
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const success = await sendNotification(email);
        if (success) {
          results.successful++;
        } else {
          results.failed++;
          results.failedEmails.push(email);
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error sending to ${email}:`, error.message);
        results.failed++;
        results.failedEmails.push(email);
      }
    });
    
    await Promise.all(batchPromises);
    
    // Add delay between batches to be respectful to SMTP server
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    
    // Verify SMTP connection
    await transporter.verify();
    console.log(`[${new Date().toISOString()}] ✅ SMTP connection verified`);
    
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
    
    transporter.close();
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Test email failed:`, error.message);
    return false;
  }
} 
