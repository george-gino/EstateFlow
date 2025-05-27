import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = ({ isOpen, onClose, properties }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your property management AI assistant. I can help you analyze your portfolio, answer questions about your tenants and properties, and provide insights to improve your business. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to Python backend
      const response = await fetch('http://localhost:5001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          properties: properties
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Fallback response when backend is not available
      const fallbackMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: "I'm sorry, I'm having trouble connecting to my AI service right now. Please make sure the Python backend is running on port 5001. In the meantime, I can see you have " + 
              (properties?.length || 0) + " properties in your portfolio" + 
              (properties?.length > 0 ? " with a total of " + 
              properties.reduce((sum, prop) => sum + prop.units.length, 0) + " units." : "."),
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSuggestedQuestions = () => {
    if (!properties || properties.length === 0) {
      return [
        "How can I get started with property management?",
        "What should I track for each property?",
        "How do I import my property data?"
      ];
    }

    return [
      "What's my occupancy rate?",
      "Which properties generate the most revenue?",
      "Are there any vacant units?",
      "What insights can you provide about my portfolio?",
      "How can I improve my rental income?"
    ];
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-panel">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <span className="chatbot-icon">🤖</span>
          <div>
            <h3>AI Property Assistant</h3>
            <span className="chatbot-status">
              {isLoading ? 'Thinking...' : 'Online'}
            </span>
          </div>
        </div>
        <button className="chatbot-close" onClick={onClose}>×</button>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}-message`}>
            <div className="message-content">
              <div className={`message-bubble ${message.isError ? 'error' : ''}`}>
                {message.text}
              </div>
              <div className="message-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="message-bubble loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="suggested-questions">
          <h4>Try asking:</h4>
          <div className="question-chips">
            {getSuggestedQuestions().map((question, index) => (
              <button
                key={index}
                className="question-chip"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chatbot-input">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your properties..."
            rows="1"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        <div className="input-hint">
          Press Enter to send • Shift + Enter for new line
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 