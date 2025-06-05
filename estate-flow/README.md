# EstateFlow - Property Management Application

A modern, comprehensive property management application built with React and Flask, featuring AI-powered portfolio analysis and automated email notifications.

## Features

### Frontend (React)
- **Property Management Dashboard**: Manage properties, units, and tenant information
- **CSV Import**: Bulk import property data from CSV files
- **AI-Powered Chatbot**: Get intelligent insights about your property portfolio
- **Modern UI**: Clean, responsive design with intuitive navigation

### Backend (Flask)
- **AI Analysis**: OpenAI GPT-4o-mini integration for property insights
- **Automated Email Notifications**: Rent reminders and overdue notifications
- **Scheduled Rent Monitoring**: Daily automated rent checks
- **RESTful API**: Complete API for property and tenant management

## Quick Start

### Frontend Development Server

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   
   Opens [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd chatbot-backend
   ```

2. **Set up Python environment:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your API keys and email configuration
   ```

4. **Start the backend server:**
   ```bash
   python app.py
   ```
   
   Backend runs on [http://localhost:5001](http://localhost:5001)

## Project Structure

```
estate-flow/
├── src/                    # React frontend source
├── public/                 # Static assets
├── chatbot-backend/        # Flask backend
│   ├── app.py             # Main Flask application
│   ├── email_service.py   # Email automation service
│   ├── scheduler_service.py # Rent monitoring scheduler
│   └── requirements.txt   # Python dependencies
├── sample_data/           # Example CSV files
├── package.json          # Node.js dependencies
└── README.md             # This file
```

## Documentation

- **[Email Automation Setup](./EMAIL_AUTOMATION_SETUP.md)** - Complete guide for automated rent notifications
- **[CSV Import Guide](./CSV_IMPORT_GUIDE.md)** - How to import property data from CSV files
- **[Chatbot Setup](./CHATBOT_SETUP.md)** - AI chatbot configuration and usage
- **[Backend API Documentation](./chatbot-backend/README.md)** - Complete API reference

## Available Scripts

### Frontend Scripts

- `npm start` - Start development server
- `npm test` - Run test runner  
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App (one-way operation)

### Backend Scripts

- `python app.py` - Start Flask backend server
- `./start.sh` - Quick start script (in chatbot-backend/)

## Production Build

```bash
npm run build
```

Creates optimized production build in the `build` folder.

## Learn More

- [React Documentation](https://reactjs.org/)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
