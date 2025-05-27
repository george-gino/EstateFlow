# 🤖 EstateFlow AI Chatbot Setup Guide

This guide will help you set up and run the new AI-powered chatbot feature for EstateFlow.

## 📋 Overview

The chatbot is a powerful AI assistant that can:
- Analyze your property portfolio
- Answer questions about occupancy rates, revenue, and tenants
- Provide insights and recommendations for improving your business
- Handle complex queries about your properties and units

## 🏗️ Architecture

- **Frontend**: React component integrated into the main dashboard
- **Backend**: Python Flask API with OpenAI integration
- **AI Model**: GPT-4 for intelligent responses and insights

## 🚀 Quick Start

### 1. Start the Python Backend

```bash
cd chatbot-backend
pip3 install -r requirements.txt
python3 app.py
```

The backend will start on `http://localhost:5001`

### 2. Start the React Frontend

```bash
# In the main project directory
npm start
```

The frontend will start on `http://localhost:3000`

### 3. Access the Chatbot

1. Click the "🤖 Chatbot" tab in the sidebar
2. The chatbot panel will slide in from the right
3. Start asking questions about your properties!

## 🔧 Configuration

### OpenAI API Key (Optional but Recommended)

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create `.env` file in `chatbot-backend/`:
   ```bash
   cp env.example .env
   ```
3. Add your API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

**Note**: The chatbot works without an API key using fallback responses, but OpenAI integration provides much more intelligent and detailed insights.

## 💬 Example Questions

Try asking the chatbot:

### Portfolio Analysis
- "What's my occupancy rate?"
- "How much revenue do I generate monthly?"
- "Which properties are performing best?"
- "Show me my vacant units"

### Insights & Recommendations
- "How can I improve my rental income?"
- "What insights can you provide about my portfolio?"
- "Which units should I focus on filling first?"
- "Are my rents competitive?"

### Specific Property Questions
- "Tell me about Sunset Apartments"
- "Which property has the lowest occupancy?"
- "How much do I earn from 123 Main Street?"
- "What's the average rent per square foot?"

## 🎯 Features

### Smart UI
- Slide-in panel design (doesn't cover the main screen)
- Auto-scrolling messages
- Typing indicators
- Suggested questions for new users
- Mobile responsive

### AI Capabilities
- Real-time property data analysis
- Revenue calculations and projections
- Occupancy rate monitoring
- Market insights and recommendations
- Comparative analysis between properties

### Fallback Mode
Even without OpenAI API:
- Basic portfolio statistics
- Keyword-based responses
- Property summaries
- Simple calculations

## 🛠️ Troubleshooting

### Backend Not Starting
```bash
# Check if Python 3 is installed
python3 --version

# Install dependencies
pip3 install flask flask-cors openai python-dotenv

# Run with debug info
cd chatbot-backend
python3 app.py
```

### Chatbot Not Responding
1. Make sure the Python backend is running on port 5001
2. Check browser console for errors
3. Verify CORS is enabled (Flask-CORS should handle this)

### OpenAI API Issues
- Verify your API key is correct
- Check your OpenAI account has credits
- The chatbot will fallback to basic responses if API fails

## 🔄 Development Workflow

1. **Add Properties**: Import CSV data or add properties manually
2. **Open Chatbot**: Click the chatbot tab to open the AI assistant
3. **Ask Questions**: Start with suggested questions or ask anything
4. **Get Insights**: Receive AI-powered analysis and recommendations

## 📱 Mobile Support

The chatbot is fully responsive:
- On desktop: 400px wide side panel
- On mobile: Full-screen overlay with touch-friendly interface

## 🔐 Security Notes

- Keep your OpenAI API key secure
- Don't commit `.env` files to version control
- Monitor API usage to control costs
- The backend only processes property data (no personal information)

## 🆘 Support

If you encounter issues:

1. **Check the logs**: Both Flask backend and React frontend show helpful error messages
2. **Test the API**: Visit `http://localhost:5001/health` to verify backend is running
3. **Review setup**: Make sure all dependencies are installed correctly

## 🎉 You're Ready!

Your AI chatbot is now ready to help you manage your property portfolio more effectively. The more data you have, the better insights it can provide!

---

**Tip**: Start by importing some properties via CSV, then ask the chatbot "What insights can you provide about my portfolio?" to see the AI in action! 