const express = require('express');
const router = express.Router();
const Email = require('../models/Email');
const { testEmailConfig } = require('../utils/emailService');
const { checkDatesheetStatus, getDatesheetInfo } = require('../utils/datesheetChecker');
const notificationManager = require('../utils/notificationManager');

/**
 * POST /subscribe
 * Subscribe a new email address
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { email, semester } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate semester
    if (!semester || isNaN(semester) || semester < 1 || semester > 8) {
      return res.status(400).json({
        success: false,
        message: 'Valid semester (1-8) is required'
      });
    }

    // Check if email already exists
    const existingEmail = await Email.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      if (existingEmail.isActive) {
        return res.status(409).json({
          success: false,
          message: 'Email is already subscribed'
        });
      } else {
        // Reactivate inactive subscription and update semester
        existingEmail.isActive = true;
        existingEmail.semester = semester;
        await existingEmail.save();
        
        return res.status(200).json({
          success: true,
          message: 'Email subscription reactivated successfully',
          email: existingEmail.email,
          semester: existingEmail.semester
        });
      }
    }

    // Create new subscription
    const newEmail = new Email({
      email: email.toLowerCase(),
      semester: semester
    });

    await newEmail.save();

    console.log(`[${new Date().toISOString()}] ✅ New subscription: ${email} (Semester ${semester})`);

    res.status(201).json({
      success: true,
      message: 'Email subscribed successfully',
      email: newEmail.email,
      semester: newEmail.semester,
      subscribedAt: newEmail.subscribedAt
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in subscribe:`, error.message);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format or semester'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /unsubscribe
 * Unsubscribe an email address
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const emailDoc = await Email.findOne({ email: email.toLowerCase() });
    
    if (!emailDoc) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    emailDoc.isActive = false;
    await emailDoc.save();

    console.log(`[${new Date().toISOString()}] ❌ Unsubscribed: ${email}`);

    res.json({
      success: true,
      message: 'Email unsubscribed successfully'
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in unsubscribe:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /emails
 * Get all subscribed emails (admin endpoint)
 */
router.get('/emails', async (req, res) => {
  try {
    const { active, limit = 100, page = 1 } = req.query;
    
    let query = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const emails = await Email.find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Email.countDocuments(query);
    const activeCount = await Email.countDocuments({ isActive: true });
    const inactiveCount = await Email.countDocuments({ isActive: false });

    res.json({
      success: true,
      data: {
        emails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        stats: {
          total,
          active: activeCount,
          inactive: inactiveCount
        }
      }
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in get emails:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /notify-all
 * Manually trigger notifications to all subscribers (admin endpoint)
 */
router.post('/notify-all', async (req, res) => {
  try {
    const results = await notificationManager.manualNotify();
    
    res.json({
      success: results.success,
      message: results.message,
      data: results
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in notify-all:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /status
 * Get system status and monitoring information
 */
router.get('/status', async (req, res) => {
  try {
    const monitoringStatus = notificationManager.getStatus();
    
    // Since datesheet has been released and all subscribers notified, 
    // return hardcoded values to avoid checking the down VU website
    const datesheetInfo = {
      title: "VU Datesheet - Spring 2025 Examinations",
      statusCode: 200,
      url: "https://datesheet.vu.edu.pk/",
      timestamp: new Date().toISOString(),
      note: "Datesheet has been released - all subscribers notified"
    };
    const datesheetStatus = true; // Force to true since datesheet is released
    
    const stats = await Email.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
        }
      }
    ]);

    // Get semester distribution
    const semesterStats = await Email.aggregate([
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get subscribers eligible for notifications (including final semester students who haven't been notified yet)
    const eligibleSubscribers = await Email.countDocuments({ 
      isActive: true,
      $or: [
        { semester: { $ne: 8 } }, // Non-final semester students
        { semester: 8, finalSemesterNotified: false } // Final semester students who haven't been notified yet
      ]
    });

    res.json({
      success: true,
      data: {
        monitoring: monitoringStatus,
        datesheet: {
          status: datesheetStatus ? 'launched' : 'not_launched',
          info: datesheetInfo
        },
        subscribers: {
          ...stats[0] || { total: 0, active: 0, inactive: 0 },
          eligible: eligibleSubscribers,
          semesterDistribution: semesterStats
        },
        server: {
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in status:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /test-email
 * Test email configuration (admin endpoint)
 */
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const success = await testEmailConfig(email);

    res.json({
      success,
      message: success ? 'Test email sent successfully' : 'Failed to send test email'
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in test-email:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /reset-notification
 * Reset notification flag (admin endpoint)
 */
router.post('/reset-notification', async (req, res) => {
  try {
    await notificationManager.resetNotificationFlag();
    
    res.json({
      success: true,
      message: 'Notification flag reset successfully'
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in reset-notification:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /start-monitoring
 * Start datesheet monitoring (admin endpoint)
 */
router.post('/start-monitoring', async (req, res) => {
  try {
    notificationManager.startMonitoring();
    
    res.json({
      success: true,
      message: 'Monitoring started successfully'
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in start-monitoring:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /stop-monitoring
 * Stop datesheet monitoring (admin endpoint)
 */
router.post('/stop-monitoring', async (req, res) => {
  try {
    notificationManager.stopMonitoring();
    
    res.json({
      success: true,
      message: 'Monitoring stopped successfully'
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in stop-monitoring:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /subscriber-count — returns total number of active subscribers
router.get('/subscriber-count', async (req, res) => {
  try {
    const count = await Email.countDocuments({ isActive: true });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router; 
