# 🚀 VU Notifier Deployment Guide

This guide will help you deploy the VU Notifier application to production.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas recommended)
- Brevo/Sendinblue account for email service
- Domain name (optional but recommended)

## 🌐 Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend Deployment (Vercel)

1. **Push to GitHub**: Upload your code to a GitHub repository
2. **Connect to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
     ```
3. **Deploy**: Vercel will automatically build and deploy your Next.js app

#### Backend Deployment (Railway)

1. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `backend` folder

2. **Set Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vu-datesheet-notifier
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your-brevo-api-key
   SMTP_PASS=your-brevo-api-key
   SMTP_FROM_EMAIL=noreply@yourdomain.com
   SMTP_FROM_NAME=VU Datesheet Notifier
   DATESHEET_URL=https://datesheet.vu.edu.pk/
   CHECK_INTERVAL=60000
   NOTIFICATION_SENT_FLAG_FILE=notification_sent.json
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

3. **Deploy**: Railway will automatically deploy your Node.js app

### Option 2: VPS Deployment (DigitalOcean, AWS, etc.)

#### Server Setup

1. **Create VPS**: Set up a Ubuntu 20.04+ server
2. **Install Dependencies**:
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx mongodb
   ```

#### Backend Deployment

1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/vu-notifier.git
   cd vu-notifier/backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

4. **Run Migration**:
   ```bash
   node utils/migration.js
   ```

5. **Start with PM2**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "vu-notifier-backend"
   pm2 save
   pm2 startup
   ```

#### Frontend Deployment

1. **Build Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

2. **Serve with Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/vu-notifier
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           root /path/to/vu-notifier/frontend/.next;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable Site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/vu-notifier /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Option 3: Heroku Deployment

#### Backend (Heroku)

1. **Create Heroku App**:
   ```bash
   heroku create your-vu-notifier-backend
   ```

2. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set SMTP_HOST=smtp-relay.brevo.com
   # ... set all other environment variables
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

#### Frontend (Vercel/Netlify)

Deploy frontend to Vercel or Netlify as described in Option 1.

## 🔧 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vu-datesheet-notifier

# Brevo/Sendinblue SMTP Configuration
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-api-key
SMTP_PASS=your-brevo-api-key
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=VU Datesheet Notifier

# VU Datesheet URL
DATESHEET_URL=https://datesheet.vu.edu.pk/

# Notification Settings
CHECK_INTERVAL=60000
NOTIFICATION_SENT_FLAG_FILE=notification_sent.json

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**: Sign up at [mongodb.com](https://mongodb.com)
2. **Create Database**: Create a new database named `vu-datesheet-notifier`
3. **Create User**: Create a database user with read/write permissions
4. **Get Connection String**: Copy the connection string and replace placeholders

### Local MongoDB

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 📧 Email Service Setup

### Brevo/Sendinblue

1. **Create Account**: Sign up at [brevo.com](https://brevo.com)
2. **Get API Key**: Generate an SMTP API key
3. **Verify Domain**: Add and verify your domain for sending emails
4. **Configure SMTP**: Use the provided SMTP settings

## 🔍 Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Frontend is loading correctly
- [ ] Database connection is working
- [ ] Email service is configured
- [ ] Admin panel is accessible
- [ ] Subscription form is working
- [ ] Monitoring system is active
- [ ] SSL certificate is installed (if using custom domain)
- [ ] Rate limiting is working
- [ ] Error logging is configured

## 🚨 Monitoring & Maintenance

### Health Checks
- Monitor `/health` endpoint
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error logging (Sentry, LogRocket)

### Database Maintenance
- Regular backups
- Monitor database size
- Clean up old data if needed

### Email Monitoring
- Monitor email delivery rates
- Check SMTP quotas
- Review bounce rates

## 🔒 Security Considerations

- Use HTTPS in production
- Keep dependencies updated
- Monitor for security vulnerabilities
- Use strong passwords for database
- Regularly rotate API keys
- Enable rate limiting
- Use environment variables for secrets

## 📞 Support

If you encounter issues during deployment:

1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database connection is working
4. Test email service configuration
5. Check CORS settings if frontend/backend are on different domains

## 🎯 Next Steps

After successful deployment:

1. **Test the System**: Subscribe with a test email
2. **Monitor Performance**: Check system resources
3. **Set Up Monitoring**: Configure alerts and logging
4. **Documentation**: Update any internal documentation
5. **Backup Strategy**: Implement regular backups
6. **Scaling Plan**: Plan for increased traffic

---

**Note**: This deployment guide assumes you have basic knowledge of the platforms mentioned. For platform-specific issues, refer to their official documentation. 