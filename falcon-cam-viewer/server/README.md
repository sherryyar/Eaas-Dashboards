# Falcon Cam Viewer Server

This is the backend server for the Falcon Cam Viewer application. It handles Slack image fetching and OpsGenie integration.

## Production Setup

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0
- A Slack workspace with appropriate permissions
- An OpsGenie account with API access

### Environment Variables
Copy `.env.production` to `.env` and fill in the following variables:
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Set to "production"
- `FRONTEND_URL`: Your frontend application URL
- `SLACK_TOKEN`: Your Slack API token
- `SLACK_CHANNEL_ID`: ID of the Slack channel to monitor
- `SLACK_BOT_TOKEN`: Your Slack bot token
- `OPSGENIE_API_KEY`: Your OpsGenie API key
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window (default: 900000)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window (default: 100)
- `LOG_LEVEL`: Logging level (default: info)

### Installation
```bash
npm install
```

### Running in Production
```bash
npm start
```

### Monitoring
The application uses Winston for logging. Logs are stored in:
- `error.log`: Error-level logs
- `combined.log`: All logs

### Security Features
- CORS protection
- Rate limiting
- Security headers
- Error handling
- Request validation
- API key protection

### Health Check
The server provides a health check endpoint at `/health` that returns the server status.

### API Endpoints
- `GET /api/slack-messages`: Fetch Slack messages with images
- `GET /api/opsgenie/oncall`: Get OpsGenie on-call information
- `GET /health`: Server health check

### Deployment
1. Set up your environment variables
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Monitor logs in `error.log` and `combined.log`

### Best Practices
- Keep your API keys secure
- Monitor server logs regularly
- Set up proper backup for the images directory
- Use HTTPS in production
- Keep dependencies updated
- Monitor server resources

### Troubleshooting
1. Check the logs in `error.log` and `combined.log`
2. Verify all environment variables are set correctly
3. Ensure proper permissions for the images directory
4. Check network connectivity to Slack and OpsGenie APIs
5. Verify rate limits are not being exceeded 