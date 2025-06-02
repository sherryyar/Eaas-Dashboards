require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const { WebClient } = require('@slack/web-api');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

const app = express();
const port = process.env.PORT || 3001;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Enable trust proxy
app.set('trust proxy', 1);

// Set OpsGenie API Key
const OPSGENIE_API_KEY = '42fdfdbe-df0d-4417-9c16-d21f197007d7';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
const opsgenieCache = new Map();

// Slack API configuration
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID || 'C08U76P4J2Y';
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

// Initialize Slack client
const slackClient = new WebClient(SLACK_BOT_TOKEN);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    opsgenieConfigured: !!OPSGENIE_API_KEY
  });
});

// Test OpsGenie API endpoint
app.get('/api/opsgenie/test', async (req, res) => {
  try {
    const response = await axios.get('https://api.opsgenie.com/v2/schedules', {
      headers: {
        'Authorization': `GenieKey ${OPSGENIE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('OpsGenie API Test Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to connect to OpsGenie API',
      details: error.response?.data || error.message
    });
  }
});

// Get on-call data for a specific schedule with caching
app.get('/api/opsgenie/schedules/:scheduleId/on-calls', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    console.log(`Fetching on-call data for schedule: ${scheduleId}`);

    // Check cache first
    const cachedData = opsgenieCache.get(scheduleId);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log(`Returning cached data for schedule: ${scheduleId}`);
      return res.json(cachedData.data);
    }

    const response = await axios.get(`https://api.opsgenie.com/v2/schedules/${scheduleId}/on-calls`, {
      headers: {
        'Authorization': `GenieKey ${OPSGENIE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Fetch user details for each on-call participant
    const onCallParticipants = await Promise.all(
      response.data.data.onCallParticipants.map(async (participant) => {
        if (participant.type === 'user') {
          try {
            const userResponse = await axios.get(`https://api.opsgenie.com/v2/users/${participant.name}`, {
              headers: {
                'Authorization': `GenieKey ${OPSGENIE_API_KEY}`,
                'Content-Type': 'application/json'
              }
            });
            return {
              ...participant,
              fullName: userResponse.data.data.fullName,
              timeZone: userResponse.data.data.timeZone
            };
          } catch (error) {
            console.error(`Error fetching user details for ${participant.name}:`, error.message);
            return participant;
          }
        }
        return participant;
      })
    );

    // Transform the response to match the expected format
    const transformedData = {
      data: {
        _parent: {
          id: response.data.data._parent.id,
          name: response.data.data._parent.name,
          enabled: response.data.data._parent.enabled,
          timezone: response.data.data._parent.timezone || 'UTC'
        },
        onCallParticipants
      }
    };

    // Cache the transformed data
    opsgenieCache.set(scheduleId, {
      data: transformedData,
      timestamp: Date.now()
    });

    console.log(`Successfully fetched and cached on-call data for schedule: ${scheduleId}`);
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching on-call data:', error);
    res.status(500).json({
      error: 'Failed to fetch on-call data',
      details: error.message
    });
  }
});

// Get user details
app.get('/api/opsgenie/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log(`Fetching user details for: ${email}`);

    const response = await axios.get(`https://api.opsgenie.com/v2/users/${email}`, {
      headers: {
        'Authorization': `GenieKey ${OPSGENIE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Successfully fetched user details for: ${email}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching user details for ${req.params.email}:`, error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch user details',
      details: error.response?.data || error.message
    });
  }
});

// Get Slack status updates
app.get('/api/slack/status', async (req, res) => {
  try {
    const { workflowId } = req.query;
    console.log('Fetching Slack status for workflow:', workflowId);

    // Get up to 1000 messages to find the workflow message
    const response = await axios.get('https://slack.com/api/conversations.history', {
      params: {
        channel: SLACK_CHANNEL_ID,
        limit: 1000 // Increased limit to search further back
      },
      headers: {
        'Authorization': `Bearer ${SLACK_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    // Find the message containing the workflow ID
    const workflowMessage = response.data.messages.find(msg => 
      msg.text && msg.text.includes(workflowId)
    );

    if (!workflowMessage) {
      console.log('No message found for workflow:', workflowId);
      return res.json({
        message: 'No status updates found',
        reactions: [],
        timestamp: new Date().toISOString()
      });
    }

    console.log('Found workflow message:', workflowMessage);
    
    // Get reactions for the workflow message
    const reactions = workflowMessage.reactions || [];
    
    // Transform reactions into status updates
    const statusUpdates = reactions.map(reaction => ({
      name: reaction.name,
      count: reaction.count,
      users: reaction.users
    }));

    res.json({
      message: workflowMessage.text,
      reactions: statusUpdates,
      timestamp: workflowMessage.ts
    });
  } catch (error) {
    console.error('Error fetching Slack status:', error);
    res.status(500).json({
      error: 'Failed to fetch Slack status',
      details: error.message
    });
  }
});

// Get social media images from Slack
app.get('/api/socials/images', async (req, res) => {
  try {
    console.log("\n================ Images from Channel ================");
    
    // Fetch recent messages from the image channel
    const imageResult = await slackClient.conversations.history({
      channel: SLACK_CHANNEL_ID,
      limit: 10,
      inclusive: true
    });

    const images = [];
    
    for (const message of imageResult.messages) {
      if (message.files && Array.isArray(message.files)) {
        for (const file of message.files) {
          if (file.mimetype && file.mimetype.startsWith('image/')) {
            const imageUrl = file.url_private;
            console.log(`Image URL: ${imageUrl}`);
            
            try {
              // Download the image
              const response = await axios.get(imageUrl, {
                headers: {
                  'Authorization': `Bearer ${SLACK_BOT_TOKEN}`
                },
                responseType: 'arraybuffer'
              });

              if (response.status === 200) {
                const imageFilename = `image_${file.id || 'unknown'}.png`;
                const imagePath = path.join(__dirname, 'images', imageFilename);
                
                // Ensure images directory exists
                if (!fs.existsSync(path.join(__dirname, 'images'))) {
                  fs.mkdirSync(path.join(__dirname, 'images'));
                }

                // Save the image
                fs.writeFileSync(imagePath, response.data);
                console.log(`Image saved as: ${imageFilename}`);

                // Add image info to response
                images.push({
                  id: file.id,
                  url: imageUrl,
                  filename: imageFilename,
                  timestamp: message.ts,
                  user: message.user || null,
                  name: file.name || null
                });
              } else {
                console.log(`Failed to download image: ${response.status}`);
              }
            } catch (error) {
              console.error(`Error downloading image: ${error.message}`);
            }
          }
        }
      }
    }

    console.log("==================================================\n");
    res.json(images);
  } catch (error) {
    console.error('Error fetching social images:', error);
    res.status(500).json({
      error: 'Failed to fetch social images',
      details: error.message
    });
  }
});

// Error handling for Slack client initialization
let slack;
try {
  slack = new WebClient(process.env.SLACK_TOKEN);
} catch (error) {
  logger.error('Failed to initialize Slack client:', error);
  process.exit(1);
}

// Error handling for directory creation
try {
  if (!fs.existsSync('images')) {
    fs.mkdirSync('images');
  }
} catch (error) {
  logger.error('Failed to create images directory:', error);
  process.exit(1);
}

// Enhanced error handling for Slack messages endpoint
app.get('/api/slack-messages', async (req, res) => {
  try {
    const result = await slack.conversations.history({
      channel: process.env.SLACK_CHANNEL_ID,
      limit: 100
    });

    const messages = result.messages.filter(msg => msg.files && msg.files.length > 0);
    const imageInfo = [];

    for (const message of messages) {
      for (const file of message.files) {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
          try {
            const response = await axios({
              method: 'get',
              url: file.url_private,
              headers: {
                'Authorization': `Bearer ${process.env.SLACK_TOKEN}`
              },
              responseType: 'stream'
            });

            const filename = `${file.id}-${file.name}`;
            const filepath = path.join('images', filename);
            const writer = fs.createWriteStream(filepath);

            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });

            imageInfo.push({
              id: file.id,
              name: file.name,
              url: `/images/${filename}`,
              timestamp: message.ts,
              user: message.user,
              permalink: file.permalink
            });
          } catch (error) {
            logger.error(`Failed to download image ${file.id}:`, error);
            continue;
          }
        }
      }
    }

    res.json(imageInfo);
  } catch (error) {
    logger.error('Error fetching Slack messages:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Slack messages',
      message: process.env.NODE_ENV === 'production' ? 'An error occurred while fetching messages' : error.message
    });
  }
});

// Enhanced error handling for OpsGenie endpoint
app.get('/api/opsgenie/oncall', async (req, res) => {
  try {
    const cacheKey = 'opsgenie_oncall';
    const cachedData = opsgenieCache.get(cacheKey);
    
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      logger.info('Returning cached OpsGenie data');
      return res.json(cachedData.data);
    }

    const response = await axios.get('https://api.opsgenie.com/v2/schedules/on-calls', {
      headers: {
        'Authorization': `GenieKey ${process.env.OPSGENIE_API_KEY}`
      }
    });

    const data = response.data;
    opsgenieCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    res.json(data);
  } catch (error) {
    logger.error('Error fetching OpsGenie data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch OpsGenie data',
      message: process.env.NODE_ENV === 'production' ? 'An error occurred while fetching on-call data' : error.message
    });
  }
});

// Serve static files with proper error handling
app.use('/images', express.static('images', {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Start server with error handling
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
}).on('error', (error) => {
  logger.error('Server failed to start:', error);
  process.exit(1);
}); 