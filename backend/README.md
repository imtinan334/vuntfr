# VU Datesheet Notifier Backend

A Node.js backend service that monitors the Virtual University (VU) exam datesheet website and sends email notifications to subscribed students when the datesheet is announced.

## 🚀 Features

- **Real-time Monitoring**: Checks VU datesheet website every 60 seconds
- **Email Notifications**: Sends beautiful HTML emails via Brevo/Sendinblue SMTP
- **Semester-Based Filtering**: Final semester students receive current notification but are excluded from future ones
- **User Subscriptions**: RESTful API for email subscription management with semester tracking
- **Rate Limiting**: Protection against API abuse
- **Admin Dashboard**: Endpoints for system monitoring and management
- **Persistent State**: Remembers if notifications were already sent
- **Graceful Shutdown**: Proper cleanup on server restart

## 🛠️ Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Nodemailer** for email delivery
- **Axios + Cheerio** for web scraping
- **Rate Limiting** with express-rate-limit
- **Security** with Helmet and CORS

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Brevo/Sendinblue account for SMTP

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd vu-datesheet-notifier
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/vu-datesheet-notifier

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
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Public Endpoints

#### Subscribe to Notifications
```http
POST /api/subscribe
Content-Type: application/json

{
  "email": "student@example.com",
  "semester": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email subscribed successfully",
  "email": "student@example.com",
  "semester": 3,
  "subscribedAt": "2024-01-15T10:30:00.000Z"
}
```

**Note**: Students in their final semester (8th semester) will receive the current notification but be excluded from future notifications.

#### Unsubscribe from Notifications
```http
POST /api/unsubscribe
Content-Type: application/json

{
  "email": "student@example.com"
}
```

#### Get System Status
```http
GET /api/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monitoring": {
      "isMonitoring": true,
      "notificationSent": false,
      "checkInterval": 60000
    },
    "datesheet": {
      "status": "not_launched",
      "info": {
        "title": "VU Datesheet",
        "lastModified": "Mon, 15 Jan 2024 10:30:00 GMT",
        "statusCode": 200
      }
    },
    "subscribers": {
      "total": 150,
      "active": 145,
      "inactive": 5,
      "eligible": 140,
      "semesterDistribution": [
        {
          "_id": 1,
          "count": 25,
          "active": 24
        },
        {
          "_id": 2,
          "count": 30,
          "active": 29
        },
        {
          "_id": 8,
          "count": 5,
          "active": 5
        }
      ]
    },
    "server": {
      "uptime": 3600,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Admin Endpoints

#### Get All Subscribers
```http
GET /api/emails?active=true&limit=50&page=1
```

#### Manually Trigger Notifications
```http
POST /api/notify-all
```

#### Test Email Configuration
```http
POST /api/test-email
Content-Type: application/json

{
  "email": "test@example.com"
}
```

#### Reset Notification Flag
```http
POST /api/reset-notification
```

#### Start/Stop Monitoring
```http
POST /api/start-monitoring
POST /api/stop-monitoring
```

### Health Check
```http
GET /health
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/vu-datesheet-notifier` |
| `SMTP_HOST` | SMTP server host | `smtp-relay.brevo.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username (API key) | Required |
| `SMTP_PASS` | SMTP password (API key) | Required |
| `SMTP_FROM_EMAIL` | From email address | Required |
| `SMTP_FROM_NAME` | From name | `VU Datesheet Notifier` |
| `DATESHEET_URL` | VU datesheet URL | `https://datesheet.vu.edu.pk/` |
| `CHECK_INTERVAL` | Monitoring interval (ms) | `60000` |

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment

#### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name "vu-notifier"
pm2 save
pm2 startup
```

#### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### Environment Setup for Production
1. Set `NODE_ENV=production`
2. Configure MongoDB Atlas or production MongoDB
3. Set up Brevo/Sendinblue SMTP credentials
4. Configure proper CORS origins
5. Set up reverse proxy (nginx) if needed

## 📊 Monitoring

The system provides comprehensive logging and monitoring:

- **Real-time Logs**: All operations are logged with timestamps
- **Status Endpoint**: Check system health and monitoring status
- **Email Tracking**: Track successful/failed email deliveries
- **Database Stats**: Monitor subscriber counts and activity

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Email format validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: HTTP headers protection
- **Error Handling**: Secure error responses

## 🧪 Testing

### Manual Testing

1. **Subscribe Test:**
```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

2. **Status Check:**
```bash
curl http://localhost:3000/api/status
```

3. **Test Email:**
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 📝 Logs

The system provides detailed logging:

```
[2024-01-15T10:30:00.000Z] 🚀 Server running on port 3000
[2024-01-15T10:30:00.000Z] 🔌 Connecting to MongoDB...
[2024-01-15T10:30:00.000Z] ✅ MongoDB Connected: localhost
[2024-01-15T10:30:00.000Z] 📋 Notification Manager initialized
[2024-01-15T10:30:00.000Z] 🚀 Starting datesheet monitoring (checking every 60 seconds)
[2024-01-15T10:30:00.000Z] Checking datesheet status at: https://datesheet.vu.edu.pk/
[2024-01-15T10:30:00.000Z] Datesheet is NOT yet launched
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the logs for error details
2. Verify environment configuration
3. Test email configuration with `/api/test-email`
4. Check system status with `/api/status`

## 🔄 Reset for New Semester

When a new semester starts:

1. Reset the notification flag:
```bash
curl -X POST http://localhost:3000/api/reset-notification
```

2. Start monitoring:
```bash
curl -X POST http://localhost:3000/api/start-monitoring
```

The system will automatically detect when the new datesheet is launched and send notifications to all active subscribers. 