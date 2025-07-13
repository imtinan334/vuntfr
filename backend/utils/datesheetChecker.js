const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Check if the VU datesheet has been launched by scraping the website
 * @returns {Promise<boolean>} true if datesheet is launched, false otherwise
 */
async function checkDatesheetStatus() {
  try {
    const url = process.env.DATESHEET_URL || 'https://datesheet.vu.edu.pk/';
    
    console.log(`[${new Date().toISOString()}] Checking datesheet status at: ${url}`);
    
    // Fetch the webpage
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (response.status !== 200) {
      console.error(`[${new Date().toISOString()}] HTTP Error: ${response.status}`);
      return false;
    }

    // Parse HTML with Cheerio
    const $ = cheerio.load(response.data);
    
    // Look for the specific text that indicates datesheet is not launched
    const pageText = $.text().toLowerCase();
    const notLaunchedText = 'date sheet is not yet launched';
    
    const isNotLaunched = pageText.includes(notLaunchedText);
    
    if (isNotLaunched) {
      console.log(`[${new Date().toISOString()}] Datesheet is NOT yet launched`);
      return false;
    } else {
      console.log(`[${new Date().toISOString()}] 🎉 DATESHEET IS LAUNCHED!`);
      return true;
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error checking datesheet status:`, error.message);
    
    // Log specific error details for debugging
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - server might be down');
    } else if (error.code === 'ENOTFOUND') {
      console.error('DNS lookup failed - check URL');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Request timed out');
    }
    
    return false;
  }
}

/**
 * Get additional information about the datesheet page
 * @returns {Promise<Object>} Page information
 */
async function getDatesheetInfo() {
  try {
    const url = process.env.DATESHEET_URL || 'https://datesheet.vu.edu.pk/';
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    return {
      title: $('title').text().trim(),
      lastModified: response.headers['last-modified'],
      contentLength: response.headers['content-length'],
      statusCode: response.status,
      url: url
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error getting datesheet info:`, error.message);
    return null;
  }
}

module.exports = {
  checkDatesheetStatus,
  getDatesheetInfo
}; 