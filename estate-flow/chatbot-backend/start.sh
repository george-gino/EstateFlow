#!/bin/bash

echo "🤖 Starting EstateFlow Chatbot Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file and add your OpenAI API key"
    echo "💡 You can get an API key from: https://platform.openai.com"
    echo ""
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Start the server
echo "🚀 Starting Flask server on http://localhost:5001"
echo "💬 The chatbot is ready to receive messages from the React frontend!"
echo ""
python app.py 