# EAAS TV App

A React-based dashboard application for tracking team locations and on-call schedules, integrated with Slack and OpsGenie.

## Features

- Real-time team location tracking via Slack reactions
- On-call schedule display using OpsGenie integration
- Modern React frontend with TypeScript
- Express.js backend for API handling
- Azure Static Web Apps deployment

## Project Structure

```
.
├── falcon-cam-viewer/          # React frontend application
│   ├── src/                   # Source code
│   ├── public/                # Static files
│   ├── server/                # Express backend
│   └── build/                 # Production build
├── location_tracker.py        # Python location tracking script
└── requirements.txt           # Python dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- Python 3.x
- Slack API credentials
- OpsGenie API key
- Azure account (for deployment)

## Environment Variables

Create the following environment files:

### Frontend (.env)
```
REACT_APP_API_URL=your_api_url
REACT_APP_SLACK_CHANNEL_ID=your_channel_id
REACT_APP_OPSGENIE_API_KEY=your_opsgenie_key
```

### Backend (.env)
```
SLACK_BOT_TOKEN=your_slack_token
SLACK_CHANNEL_ID=your_channel_id
OPSGENIE_API_KEY=your_opsgenie_key
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd EAAS-TV-APP
```

2. Install frontend dependencies:
```bash
cd falcon-cam-viewer
npm install
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Development

1. Start the frontend development server:
```bash
cd falcon-cam-viewer
npm start
```

2. Start the backend server:
```bash
cd falcon-cam-viewer
npm run server
```

## Production Build

```bash
cd falcon-cam-viewer
npm run build
```

## Deployment

The application is configured for deployment to Azure Static Web Apps. The deployment is handled automatically through GitHub Actions when pushing to the main branch.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
