const express = require('express');
const cors = require('cors');
const { WebClient } = require('@slack/web-api');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Slack client with bot token
const client = new WebClient(process.env.SLACK_BOT_TOKEN);

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Helper function to get username
async function getUsername(userId) {
  try {
    const result = await client.users.info({ user: userId });
    return result.user.real_name;
  } catch (error) {
    console.error(`Error fetching user info for ${userId}:`, error);
    return `Unknown User (${userId})`;
  }
}

// Location tracking endpoint
app.get('/api/location-tracking', async (req, res) => {
  try {
    console.log('Fetching location data...');
    const conversationId = process.env.SLACK_CHANNEL_ID;
    
    // Fetch messages
    const result = await client.conversations.history({
      channel: conversationId,
      inclusive: true,
      limit: 100
    });

    // Find the workflow message
    const workflowMessage = result.messages.find(msg => 
      msg.text && msg.text.includes('Hi Fantastic Humans')
    );

    if (!workflowMessage) {
      console.log('No check-in message found');
      return res.json({
        error: 'No check-in message found',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Found check-in message, getting reactions...');

    // Get reactions
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
      for (const reaction of reactionsResult.message.reactions) {
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
      }
    }

    console.log('Location data fetched successfully:', locationData);
    res.json(locationData);
  } catch (error) {
    console.error('Error fetching location data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch location data',
      message: error.message
    });
  }
});

// OpsGenie endpoint for on-call schedules
app.get('/api/opsgenie/schedules/:scheduleId/on-calls', async (req, res) => {
  try {
    console.log('Fetching OpsGenie on-call data...');
    const { scheduleId } = req.params;
    
    const response = await axios.get(`https://api.opsgenie.com/v2/schedules/${scheduleId}/on-calls`, {
      headers: {
        'Authorization': `GenieKey ${process.env.OPSGENIE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Transform the data to match the frontend's expected format
    const transformedData = {
      data: {
        _parent: {
          id: response.data.data._parent.id,
          name: response.data.data._parent.name,
          enabled: response.data.data._parent.enabled,
          timezone: 'UTC', // Default timezone if not provided
          rotations: [] // Empty array if not provided
        },
        onCallParticipants: response.data.data.onCallParticipants.map(participant => ({
          name: participant.name,
          type: participant.type,
          fullName: participant.name.split('@')[0], // Extract name from email
          timeZone: 'UTC' // Default timezone if not provided
        }))
      }
    };

    console.log('OpsGenie data fetched and transformed successfully');
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching OpsGenie data:', error);
    res.status(500).json({
      error: 'Failed to fetch OpsGenie data',
      message: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Slack Channel ID:', process.env.SLACK_CHANNEL_ID);
}); 