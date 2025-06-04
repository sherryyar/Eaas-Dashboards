const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const { WebClient } = require('@slack/web-api');
const axios = require('axios');
const dotenv = require('dotenv');
const helmet = require('helmet');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const app = express();
const port = process.env.PORT || 10000;

// Security middleware
app.use(helmet());
app.use(compression());

// Initialize Slack client with bot token
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

// Enable CORS with specific origin
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://eaas-frontend.onrender.com', 'https://eaas-backend.onrender.com'] 
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
};

// Helper function to get username with caching
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getUsername(userId) {
  const cached = userCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.username;
  }

  try {
    const result = await client.users.info({ user: userId });
    const username = result.user.real_name;
    userCache.set(userId, { username, timestamp: Date.now() });
    return username;
  } catch (error) {
    logger.error(`Error fetching user info for ${userId}:`, error);
    return `Unknown User (${userId})`;
  }
}

// Location tracking endpoint with caching
const locationCache = new Map();
const LOCATION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

app.get('/api/location-tracking', async (req, res, next) => {
  try {
    const cached = locationCache.get('location');
    if (cached && Date.now() - cached.timestamp < LOCATION_CACHE_TTL) {
      return res.json(cached.data);
    }

    logger.info('Fetching location data...');
    const conversationId = process.env.SLACK_CHANNEL_ID;
    
    const result = await client.conversations.history({
      channel: conversationId,
      inclusive: true,
      limit: 100
    });

    const workflowMessage = result.messages.find(msg => 
      msg.text && msg.text.includes('Hi Fantastic Humans')
    );

    if (!workflowMessage) {
      logger.info('No check-in message found');
      return res.json({
        error: 'No check-in message found',
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Found check-in message, getting reactions...');

    const reactionsResult = await client.reactions.get({
      channel: conversationId,
      timestamp: workflowMessage.ts
    });

    const locationData = {
      workingFromHome: [],
      workingFromOffice: [],
      onLeave: [],
      totalResponses: 0,
      timestamp: new Date().toISOString()
    };

    if (reactionsResult.message && reactionsResult.message.reactions) {
      await Promise.all(reactionsResult.message.reactions.map(async (reaction) => {
        const usernames = await Promise.all(
          reaction.users.map(userId => getUsername(userId))
        );

        if (reaction.name === 'house') {
          locationData.workingFromHome = usernames;
        } else if (reaction.name === 'office') {
          locationData.workingFromOffice = usernames;
        } else if (['face_vomiting', 'face_with_thermometer', 'nauseated_face', 
                   'sneezing_face', 'sick', 'brain', 'face_with_head_bandage', 
                   'mending_heart'].includes(reaction.name)) {
          locationData.onLeave = usernames;
        }

        locationData.totalResponses += usernames.length;
      }));
    }

    locationCache.set('location', { data: locationData, timestamp: Date.now() });
    logger.info('Location data fetched successfully');
    res.json(locationData);
  } catch (error) {
    next(error);
  }
});

// OpsGenie endpoint with caching
const opsgenieCache = new Map();
const OPSGENIE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

app.get('/api/opsgenie/schedules/:scheduleId/on-calls', async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const cacheKey = `opsgenie-${scheduleId}`;
    
    const cached = opsgenieCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < OPSGENIE_CACHE_TTL) {
      logger.info('Returning cached OpsGenie data');
      return res.json(cached.data);
    }

    logger.info(`Fetching OpsGenie on-call data for schedule ${scheduleId}...`);
    
    if (!process.env.OPSGENIE_API_KEY) {
      logger.error('OPSGENIE_API_KEY is not set');
      return res.status(500).json({ error: 'OpsGenie API key is not configured' });
    }

    const response = await axios.get(`https://api.opsgenie.com/v2/schedules/${scheduleId}/on-calls`, {
      headers: {
        'Authorization': `GenieKey ${process.env.OPSGENIE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    logger.info('Successfully fetched OpsGenie data');
    
    const transformedData = {
      data: {
        _parent: {
          id: response.data.data._parent.id,
          name: response.data.data._parent.name,
          enabled: response.data.data._parent.enabled,
          timezone: 'UTC',
          rotations: []
        },
        onCallParticipants: response.data.data.onCallParticipants || []
      }
    };

    opsgenieCache.set(cacheKey, { data: transformedData, timestamp: Date.now() });
    res.json(transformedData);
  } catch (error) {
    logger.error('Error fetching OpsGenie data:', error.message);
    if (error.response) {
      logger.error('OpsGenie API response:', error.response.data);
      return res.status(error.response.status).json({
        error: 'Error fetching OpsGenie data',
        details: error.response.data
      });
    }
    next(error);
  }
});

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '../build')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Apply error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 