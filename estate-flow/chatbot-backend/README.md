# EstateFlow Chatbot Backend

An AI-powered chatbot backend for the EstateFlow property management application. This Flask-based API integrates with OpenAI's GPT-4o-mini model to provide intelligent property portfolio analysis and includes automated email notifications for rent management.

## Features

- **AI-Powered Analysis**: Uses OpenAI's GPT-4o-mini for intelligent property data analysis
- **Automated Email Notifications**: Sends overdue rent notifications and tenant reminders
- **Scheduled Rent Checks**: Daily automated rent monitoring with configurable grace periods
- **Property Portfolio Insights**: Analyzes occupancy rates, revenue, tenant information, and more
- **Fallback Responses**: Provides meaningful insights even when AI API is unavailable
- **RESTful API**: Easy integration with frontend applications
- **Error Handling**: Comprehensive error handling and logging

## Setup

### Prerequisites

- Python 3.8+
- pip package manager
- OpenAI API key (get one at https://platform.openai.com/api-keys)
- Gmail account with App Password for email notifications

### Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit the `.env` file and add your configuration:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   SENDER_EMAIL=your_sender_email@gmail.com
   SENDER_PASSWORD=your_gmail_app_password
   LANDLORD_EMAIL=your_landlord_email@gmail.com
   ```

3. **Configure Gmail App Password** (required for email features):
   - Go to https://myaccount.google.com/
   - Enable 2-Step Verification
   - Generate App Password for Mail
   - Use the 16-character app password in SENDER_PASSWORD

4. **Run the server:**
   ```bash
   python app.py
   ```

   The server will start on `http://localhost:5001`

### Quick Start Script

You can also use the provided startup script:
```bash
chmod +x start.sh
./start.sh
```

## API Endpoints

### POST /chat
Send messages to the AI assistant for property analysis.

**Request:**
```json
{
  "message": "What's my occupancy rate?",
  "properties": [
    {
      "name": "Property Name",
      "address": "Property Address",
      "units": [
        {
          "number": "101",
          "bedrooms": 2,
          "bathrooms": 1,
          "squareFeet": 800,
          "rent": 1200,
          "tenant": {
            "name": "John Doe"
          }
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "response": "Your current occupancy rate is 95%. You have 2 vacant units out of 40 total units..."
}
```

### GET /health
Health check endpoint to verify the service is running.

**Response:**
```json
{
  "status": "healthy",
  "message": "Chatbot backend is running"
}
```

### Email Automation Endpoints

#### POST /scheduler/start
Start the automated rent scheduler.

**Response:**
```json
{
  "success": true,
  "message": "Rent scheduler started successfully"
}
```

#### POST /scheduler/stop
Stop the automated rent scheduler.

**Response:**
```json
{
  "success": true,
  "message": "Rent scheduler stopped successfully"
}
```

#### GET /scheduler/status
Get current scheduler status and configuration.

**Response:**
```json
{
  "success": true,
  "status": {
    "running": true,
    "check_time": "09:00",
    "grace_period_days": 3,
    "reminder_days_before": [3, 1],
    "next_run": "2025-05-31 09:00:00",
    "scheduled_jobs": 1
  }
}
```

#### POST /scheduler/manual-check
Manually trigger a rent check (useful for testing).

**Response:**
```json
{
  "success": true,
  "message": "Manual rent check completed"
}
```

#### POST /email/test
Send a test email to verify email configuration.

**Request:**
```json
{
  "email": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully to test@example.com"
}
```

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required for AI responses)
- `FLASK_ENV`: Set to 'development' for debug mode
- `PORT`: Server port (default: 5001)

### OpenAI API Requirements

Your OpenAI API key needs:
- Valid billing setup on your OpenAI account
- Access to chat completions API
- Sufficient quota for API calls

## Features

### AI Analysis Capabilities

The chatbot can analyze:
- **Occupancy Rates**: Current vacancy status and recommendations
- **Revenue Analysis**: Monthly/annual revenue calculations and insights
- **Tenant Information**: Rent comparisons, tenant details
- **Property Performance**: Individual property analysis and comparisons
- **Portfolio Optimization**: Suggestions for improving revenue and efficiency

### Fallback System

When OpenAI API is unavailable, the system provides:
- Basic portfolio statistics
- Occupancy rate calculations
- Revenue summaries
- Property performance metrics
- Actionable recommendations

## Development

### Project Structure

```
chatbot-backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── .env               # Environment variables (not in git)
├── env.example        # Environment template
├── start.sh           # Startup script
├── README.md          # This file
└── logs/              # Application logs
```

### Adding New Features

1. Extend the `PropertyAnalyzer` class in `app.py`
2. Add new analysis methods for specific property insights
3. Update the fallback system for offline capabilities
4. Test with various property data formats

## Troubleshooting

### Common Issues

1. **Port 5001 already in use:**
   ```bash
   lsof -ti:5001 | xargs kill -9
   ```

2. **OpenAI API errors:**
   - Check your API key is valid
   - Ensure billing is set up on OpenAI account
   - Verify API key permissions include 'model.request'

3. **CORS errors:**
   - Ensure Flask-CORS is installed
   - Check frontend is making requests to correct port (5001)

4. **Import errors:**
   ```bash
   pip install -r requirements.txt
   ```

## Security Notes

- Never commit `.env` files to version control
- Keep your OpenAI API key secure
- Use environment variables for sensitive configuration
- Consider rate limiting for production deployments

## License

Part of the EstateFlow property management application. 