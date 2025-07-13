const fs = require('fs').promises;
const path = require('path');
const { checkDatesheetStatus } = require('./datesheetChecker');
const { sendBulkNotifications } = require('./emailService');
const Email = require('../models/Email');

class NotificationManager {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.notificationSent = false;
    this.flagFile = process.env.NOTIFICATION_SENT_FLAG_FILE || 'notification_sent.json';
  }

  /**
   * Initialize the notification manager
   */
  async initialize() {
    try {
      // Load notification sent flag
      await this.loadNotificationFlag();
      
      console.log(`[${new Date().toISOString()}] 📋 Notification Manager initialized`);
      console.log(`[${new Date().toISOString()}] Notification already sent: ${this.notificationSent}`);
      
      return true;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error initializing notification manager:`, error.message);
      return false;
    }
  }

  /**
   * Load notification sent flag from file
   */
  async loadNotificationFlag() {
    try {
      const flagPath = path.join(process.cwd(), this.flagFile);
      const data = await fs.readFile(flagPath, 'utf8');
      const flagData = JSON.parse(data);
      
      this.notificationSent = flagData.notificationSent || false;
      console.log(`[${new Date().toISOString()}] Loaded notification flag: ${this.notificationSent}`);
    } catch (error) {
      // File doesn't exist or is invalid, start fresh
      this.notificationSent = false;
      console.log(`[${new Date().toISOString()}] No existing notification flag found, starting fresh`);
    }
  }

  /**
   * Save notification sent flag to file
   */
  async saveNotificationFlag() {
    try {
      const flagPath = path.join(process.cwd(), this.flagFile);
      const flagData = {
        notificationSent: this.notificationSent,
        lastUpdated: new Date().toISOString()
      };
      
      await fs.writeFile(flagPath, JSON.stringify(flagData, null, 2));
      console.log(`[${new Date().toISOString()}] Saved notification flag: ${this.notificationSent}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error saving notification flag:`, error.message);
    }
  }

  /**
   * Start monitoring the datesheet
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.log(`[${new Date().toISOString()}] Monitoring is already running`);
      return;
    }

    if (this.notificationSent) {
      console.log(`[${new Date().toISOString()}] Notification already sent, skipping monitoring`);
      return;
    }

    const interval = parseInt(process.env.CHECK_INTERVAL) || 60000; // Default 60 seconds
    
    console.log(`[${new Date().toISOString()}] 🚀 Starting datesheet monitoring (checking every ${interval/1000} seconds)`);
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      await this.checkAndNotify();
    }, interval);

    // Do an immediate check
    this.checkAndNotify();
  }

  /**
   * Stop monitoring the datesheet
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.isMonitoring = false;
    console.log(`[${new Date().toISOString()}] ⏹️ Stopped datesheet monitoring`);
  }

  /**
   * Check datesheet status and send notifications if needed
   */
  async checkAndNotify() {
    try {
      // Check if notification was already sent
      if (this.notificationSent) {
        console.log(`[${new Date().toISOString()}] Notification already sent, skipping check`);
        return;
      }

      // Check datesheet status
      const isLaunched = await checkDatesheetStatus();
      
      if (isLaunched) {
        console.log(`[${new Date().toISOString()}] 🎉 Datesheet is launched! Sending notifications...`);
        
        // Get all active subscribers (including final semester students who haven't been notified yet)
        const subscribers = await Email.find({ 
          isActive: true,
          $or: [
            { semester: { $ne: 8 } }, // Non-final semester students
            { semester: 8, finalSemesterNotified: false } // Final semester students who haven't been notified yet
          ]
        }).select('email semester');
        const emails = subscribers.map(sub => sub.email);
        
        if (emails.length === 0) {
          console.log(`[${new Date().toISOString()}] No active subscribers found`);
          this.notificationSent = true;
          await this.saveNotificationFlag();
          return;
        }

        console.log(`[${new Date().toISOString()}] 📧 Sending notifications to ${emails.length} subscribers`);

        // Send notifications
        const results = await sendBulkNotifications(emails);
        
        if (results.successful > 0) {
          // Update lastNotified for successful emails
          const successfulEmails = emails.filter(email => !results.failedEmails.includes(email));
          await Email.updateMany(
            { email: { $in: successfulEmails } },
            { 
              lastNotified: new Date(),
              // Mark final semester students as notified for this cycle
              $set: {
                finalSemesterNotified: true
              }
            }
          );
          
          console.log(`[${new Date().toISOString()}] ✅ Successfully notified ${results.successful} subscribers`);
        }

        // Mark notification as sent
        this.notificationSent = true;
        await this.saveNotificationFlag();
        
        // Stop monitoring since notification is sent
        this.stopMonitoring();
        
        console.log(`[${new Date().toISOString()}] 🎯 Notification cycle completed`);
      }
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in checkAndNotify:`, error.message);
    }
  }

  /**
   * Manually trigger notifications to all subscribers
   */
  async manualNotify() {
    try {
      console.log(`[${new Date().toISOString()}] 📧 Manual notification triggered`);
      
      // Get all active subscribers (including final semester students who haven't been notified yet)
      const subscribers = await Email.find({ 
        isActive: true,
        $or: [
          { semester: { $ne: 8 } }, // Non-final semester students
          { semester: 8, finalSemesterNotified: false } // Final semester students who haven't been notified yet
        ]
      }).select('email semester');
      const emails = subscribers.map(sub => sub.email);
      
      if (emails.length === 0) {
        console.log(`[${new Date().toISOString()}] No active subscribers found`);
        return {
          success: false,
          message: 'No active subscribers found',
          total: 0
        };
      }

      console.log(`[${new Date().toISOString()}] 📧 Sending manual notifications to ${emails.length} subscribers`);

      const results = await sendBulkNotifications(emails);
      
      // Update lastNotified for successful emails
      if (results.successful > 0) {
        const successfulEmails = emails.filter(email => !results.failedEmails.includes(email));
        await Email.updateMany(
          { email: { $in: successfulEmails } },
          { 
            lastNotified: new Date(),
            // Mark final semester students as notified for this cycle
            $set: {
              finalSemesterNotified: true
            }
          }
        );
      }

      return {
        success: true,
        message: `Notifications sent to ${results.successful}/${results.total} subscribers`,
        ...results
      };
      
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in manual notification:`, error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Reset notification flag (for testing or new semester)
   */
  async resetNotificationFlag() {
    this.notificationSent = false;
    await this.saveNotificationFlag();
    console.log(`[${new Date().toISOString()}] 🔄 Notification flag reset`);
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      notificationSent: this.notificationSent,
      checkInterval: parseInt(process.env.CHECK_INTERVAL) || 60000
    };
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

module.exports = notificationManager; 