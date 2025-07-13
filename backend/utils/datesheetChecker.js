const axios = require('axios');
const cheerio = require('cheerio');

// Retry function with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`[${new Date().toISOString()}] Datesheet check attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Check if the VU datesheet has been launched by scraping the website
 * @returns {Promise<boolean>} true if datesheet is launched, false otherwise
 */
async function checkDatesheetStatus() {
  try {
    const url = process.env.DATESHEET_URL || 'https://datesheet.vu.edu.pk/';
    
    console.log(`[${new Date().toISOString()}] Checking datesheet status at: ${url}`);
    
    const checkDatesheet = async () => {
      // Fetch the webpage with enhanced configuration
      const response = await axios.get(url, {
        timeout: 15000, // Increased timeout to 15 seconds
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 300; // Accept only 2xx status codes
        }
      });

      if (response.status !== 200) {
        console.error(`[${new Date().toISOString()}] HTTP Error: ${response.status}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse HTML with Cheerio
      const $ = cheerio.load(response.data);
      
      // Look for the specific text that indicates datesheet is not launched
      const pageText = $.text().toLowerCase();
      const notLaunchedText = 'date sheet is not yet launched';
      
      // Also check for alternative text patterns
      const alternativeNotLaunchedTexts = [
        'datesheet is not yet launched',
        'date sheet not launched',
        'datesheet not launched',
        'not yet launched',
        'coming soon',
        'will be announced'
      ];
      
      const isNotLaunched = pageText.includes(notLaunchedText) || 
                           alternativeNotLaunchedTexts.some(text => pageText.includes(text));
      
      if (isNotLaunched) {
        console.log(`[${new Date().toISOString()}] Datesheet is NOT yet launched`);
        return false;
      } else {
        console.log(`[${new Date().toISOString()}] 🎉 DATESHEET IS LAUNCHED!`);
        return true;
      }
    };

    return await retryWithBackoff(checkDatesheet);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error checking datesheet status:`, error.message);
    
    // Log specific error details for debugging
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - VU server might be down');
    } else if (error.code === 'ENOTFOUND') {
      console.error('DNS lookup failed - check DATESHEET_URL configuration');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Request timed out - VU server might be slow');
    } else if (error.code === 'ECONNRESET') {
      console.error('Connection reset - network issue or server overload');
    } else if (error.response) {
      console.error(`VU server responded with status: ${error.response.status}`);
      console.error('Response headers:', error.response.headers);
    }
    
    // Return false on error to be safe (assume datesheet is not launched)
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
    
    const getInfo = async () => {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });

      const $ = cheerio.load(response.data);
      
      return {
        title: $('title').text().trim(),
        lastModified: response.headers['last-modified'],
        contentLength: response.headers['content-length'],
        statusCode: response.status,
        url: url,
        responseTime: response.headers['x-response-time'] || 'unknown',
        server: response.headers['server'] || 'unknown'
      };
    };

    return await retryWithBackoff(getInfo);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error getting datesheet info:`, error.message);
    return {
      error: error.message,
      url: process.env.DATESHEET_URL || 'https://datesheet.vu.edu.pk/',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Check if the VU website is accessible (health check)
 * @returns {Promise<boolean>} true if accessible, false otherwise
 */
async function checkVUWebsiteHealth() {
  try {
    const url = process.env.DATESHEET_URL || 'https://datesheet.vu.edu.pk/';
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Accept any response that's not a server error
      }
    });

    return {
      accessible: true,
      statusCode: response.status,
      responseTime: response.headers['x-response-time'] || 'unknown',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      accessible: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  checkDatesheetStatus,
  getDatesheetInfo,
  checkVUWebsiteHealth
}; 
