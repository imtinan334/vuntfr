const Email = require('../models/Email');

/**
 * Migration script to add semester field to existing subscribers
 * This should be run once after deploying the semester feature
 */
async function migrateSemesterField() {
  try {
    console.log('[MIGRATION] Starting semester field migration...');
    
    // Find all documents without semester field
    const emailsWithoutSemester = await Email.find({ semester: { $exists: false } });
    
    if (emailsWithoutSemester.length === 0) {
      console.log('[MIGRATION] No emails found without semester field. Migration not needed.');
    } else {
      console.log(`[MIGRATION] Found ${emailsWithoutSemester.length} emails without semester field.`);
      
      // Set default semester to 1 for existing subscribers
      const result = await Email.updateMany(
        { semester: { $exists: false } },
        { $set: { semester: 1 } }
      );
      
      console.log(`[MIGRATION] Successfully updated ${result.modifiedCount} emails with default semester.`);
    }

    // Find all documents without finalSemesterNotified field
    const emailsWithoutFinalSemesterNotified = await Email.find({ finalSemesterNotified: { $exists: false } });
    
    if (emailsWithoutFinalSemesterNotified.length === 0) {
      console.log('[MIGRATION] No emails found without finalSemesterNotified field. Migration not needed.');
    } else {
      console.log(`[MIGRATION] Found ${emailsWithoutFinalSemesterNotified.length} emails without finalSemesterNotified field.`);
      
      // Set default finalSemesterNotified to false for existing subscribers
      const result = await Email.updateMany(
        { finalSemesterNotified: { $exists: false } },
        { $set: { finalSemesterNotified: false } }
      );
      
      console.log(`[MIGRATION] Successfully updated ${result.modifiedCount} emails with default finalSemesterNotified.`);
    }
    
    console.log('[MIGRATION] Migration completed successfully.');
    
  } catch (error) {
    console.error('[MIGRATION] Error during migration:', error.message);
    throw error;
  }
}

/**
 * Run migration if this file is executed directly
 */
if (require.main === module) {
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  
  dotenv.config();
  
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vu-datesheet-notifier';
  
  mongoose.connect(mongoURI)
    .then(() => {
      console.log('[MIGRATION] Connected to MongoDB');
      return migrateSemesterField();
    })
    .then(() => {
      console.log('[MIGRATION] Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[MIGRATION] Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateSemesterField }; 