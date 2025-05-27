# EstateFlow 🏠

A comprehensive property management application with AI-powered analytics and insights. EstateFlow helps property managers track tenants, units, revenue, and get intelligent recommendations for portfolio optimization.

## 🌟 Features

### Core Property Management
- **Property Portfolio Management**: Add, edit, and organize multiple properties
- **Unit Tracking**: Manage individual units with detailed information
- **Tenant Management**: Track tenant information and lease details
- **Revenue Analytics**: Monitor rental income and financial performance
- **CSV Import/Export**: Bulk property data management

### AI-Powered Chatbot 🤖
- **Intelligent Analysis**: AI-powered property portfolio insights using OpenAI GPT-4o-mini
- **Natural Language Queries**: Ask questions in plain English about your portfolio
- **Real-time Recommendations**: Get suggestions for optimizing occupancy and revenue
- **Comprehensive Reporting**: Detailed analytics on performance metrics
- **Fallback Analytics**: Basic insights even without AI connectivity

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- Python 3.8+
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/EstateFlow.git
   cd EstateFlow
   ```

2. **Set up the frontend:**
   ```bash
   cd estate-flow
   npm install
   npm start
   ```
   Frontend will run on `http://localhost:3000`

3. **Set up the backend:**
   ```bash
   cd estate-flow/chatbot-backend
   pip install -r requirements.txt
   cp env.example .env
   # Edit .env and add your OpenAI API key
   python app.py
   ```
   Backend will run on `http://localhost:5001`

## 🏗️ Architecture

```
EstateFlow/
├── estate-flow/                    # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js        # Main dashboard with sidebar
│   │   │   ├── Chatbot.js         # AI chatbot component
│   │   │   ├── Chatbot.css        # Chatbot styling
│   │   │   └── CSVUpload.js       # Property data import
│   │   └── ...
│   ├── chatbot-backend/           # Python Flask API
│   │   ├── app.py                 # Main Flask application
│   │   ├── requirements.txt       # Python dependencies
│   │   ├── .env                   # Environment variables (not in git)
│   │   └── README.md              # Backend documentation
│   └── package.json
├── EstateFlowDocs/                # Documentation
└── README.md                      # This file
```

## 💬 AI Chatbot Capabilities

The AI chatbot can help you with:

- **Portfolio Overview**: "What's my current occupancy rate?"
- **Revenue Analysis**: "How much revenue do I generate monthly?"
- **Property Comparison**: "Which property performs best?"
- **Optimization Tips**: "How can I improve my rental income?"
- **Tenant Information**: "Who pays the highest rent?"
- **Vacancy Analysis**: "Show me all vacant units"
- **Market Insights**: "What's my average rent per square foot?"

### Example Interactions

```
🧑: "What's my occupancy rate?"
🤖: "Your current occupancy rate is 94.2%. You have 3 vacant units out of 52 total units. This is excellent performance!"

🧑: "Which tenant pays the most rent?"
🤖: "Sarah Johnson in unit #301 at Sunset Apartments pays the highest rent at $2,400/month."

🧑: "How can I increase my revenue?"
🤖: "Based on your data, you could increase annual revenue by $43,200 by filling vacant units. Consider marketing upgrades for units below market rate."
```

## 🛠️ Technologies Used

### Frontend
- **React.js**: Modern UI framework
- **CSS3**: Responsive styling and animations
- **JavaScript ES6+**: Modern JavaScript features

### Backend
- **Python 3.8+**: Core backend language
- **Flask**: Web framework for API
- **OpenAI API**: GPT-4o-mini integration
- **Flask-CORS**: Cross-origin resource sharing

### AI Integration
- **OpenAI GPT-4o-mini**: Natural language processing
- **Property Data Analysis**: Custom analytics engine
- **Intelligent Fallbacks**: Offline capabilities

## 📊 Key Features Detail

### Property Management Dashboard
- Clean, intuitive interface for property overview
- Real-time updates and data synchronization
- Mobile-responsive design

### CSV Data Import
- Bulk import property and tenant data
- Automatic data validation and processing
- Support for various CSV formats

### AI Chat Interface
- Side-panel design for easy access
- Auto-scrolling conversation history
- Typing indicators and smooth animations
- Suggested questions for new users

### Analytics & Reporting
- Occupancy rate calculations
- Revenue tracking and projections
- Property performance comparisons
- Tenant and unit analysis

## 🔧 Configuration

### Environment Variables

**Backend (.env file):**
```
OPENAI_API_KEY=your_openai_api_key_here
FLASK_ENV=development
PORT=5001
```

### OpenAI API Setup
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Ensure billing is set up on your OpenAI account
3. Verify API key has proper permissions for chat completions

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Frontend (React)
   kill -9 $(lsof -ti:3000)
   
   # Backend (Flask)
   kill -9 $(lsof -ti:5001)
   ```

2. **OpenAI API errors:**
   - Check API key validity
   - Verify billing setup
   - Ensure sufficient quota

3. **CORS issues:**
   - Verify backend is running on port 5001
   - Check frontend API calls use correct endpoint

## 🚀 Development

### Running in Development Mode

1. **Frontend:**
   ```bash
   cd estate-flow
   npm start
   ```

2. **Backend:**
   ```bash
   cd estate-flow/chatbot-backend
   python app.py
   ```

### Adding New Features

1. **Frontend components**: Add to `src/components/`
2. **Backend endpoints**: Extend `app.py`
3. **AI capabilities**: Enhance `PropertyAnalyzer` class
4. **Styling**: Update component CSS files

## 📝 API Documentation

### Chat Endpoint
```http
POST http://localhost:5001/chat
Content-Type: application/json

{
  "message": "What's my occupancy rate?",
  "properties": [...property data...]
}
```

### Health Check
```http
GET http://localhost:5001/health
```

## 🔐 Security

- Environment variables for sensitive data
- No API keys committed to version control
- CORS configuration for secure frontend integration
- Input validation and error handling

## 📄 License

This project is part of the EstateFlow property management application suite.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review backend documentation in `estate-flow/chatbot-backend/README.md`
- Create an issue in the repository

---

**EstateFlow** - Intelligent Property Management Made Simple 🏠✨