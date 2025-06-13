import React, { useState, useEffect } from 'react';
import { MdWarning, MdSchedule, MdBuild, MdEmail } from 'react-icons/md';
import './EmailAutomation.css';

const EmailAutomation = ({ isOpen, onClose }) => {
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const API_BASE = 'http://localhost:5001';

  useEffect(() => {
    if (isOpen) {
      fetchSchedulerStatus();
    }
  }, [isOpen]);

  const fetchSchedulerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/scheduler/status`);
      const data = await response.json();
      if (data.success) {
        setSchedulerStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching scheduler status:', error);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const startScheduler = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/scheduler/start`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        showMessage('Scheduler started successfully!', 'success');
        fetchSchedulerStatus();
      } else {
        showMessage(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      showMessage(`Error starting scheduler: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const stopScheduler = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/scheduler/stop`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        showMessage('Scheduler stopped successfully!', 'success');
        fetchSchedulerStatus();
      } else {
        showMessage(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      showMessage(`Error stopping scheduler: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const runManualCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/scheduler/manual-check`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        showMessage('Manual rent check completed!', 'success');
      } else {
        showMessage(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      showMessage(`Error running manual check: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      showMessage('Please enter an email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/email/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: testEmail })
      });
      const data = await response.json();
      
      if (data.success) {
        showMessage(`Test email sent successfully to ${testEmail}`, 'success');
      } else {
        showMessage(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      showMessage(`Error sending test email: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="email-automation-overlay" onClick={onClose}>
      <div className="email-automation-modal" onClick={e => e.stopPropagation()}>
        <div className="email-automation-header">
          <h2><MdEmail style={{ marginRight: '8px', verticalAlign: 'middle' }} />Email Automation</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="email-automation-content">
          {/* Scheduler Status */}
          <div className="status-section">
            <h3>Scheduler Status</h3>
            {schedulerStatus ? (
              <div className="status-info">
                <div className={`status-indicator ${schedulerStatus.running ? 'running' : 'stopped'}`}>
                  {schedulerStatus.running ? '🟢 Running' : '🔴 Stopped'}
                </div>
                <div className="status-details">
                  <p><strong>Check Time:</strong> {schedulerStatus.check_time} daily</p>
                  <p><strong>Grace Period:</strong> {schedulerStatus.grace_period_days} days</p>
                  <p><strong>Reminder Days:</strong> {schedulerStatus.reminder_days_before.join(', ')} days before due</p>
                  {schedulerStatus.next_run && (
                    <p><strong>Next Run:</strong> {schedulerStatus.next_run}</p>
                  )}
                </div>
              </div>
            ) : (
              <p>Loading status...</p>
            )}
          </div>

          {/* Scheduler Controls */}
          <div className="controls-section">
            <h3>Scheduler Controls</h3>
            <div className="button-group">
              <button 
                className="btn-primary" 
                onClick={startScheduler}
                disabled={loading || (schedulerStatus && schedulerStatus.running)}
              >
                {loading ? 'Starting...' : 'Start Scheduler'}
              </button>
              
              <button 
                className="btn-secondary" 
                onClick={stopScheduler}
                disabled={loading || (schedulerStatus && !schedulerStatus.running)}
              >
                {loading ? 'Stopping...' : 'Stop Scheduler'}
              </button>
              
              <button 
                className="btn-action" 
                onClick={runManualCheck}
                disabled={loading}
              >
                {loading ? 'Running...' : 'Manual Check'}
              </button>
            </div>
          </div>

          {/* Test Email */}
          <div className="test-section">
            <h3>Test Email Configuration</h3>
            <p>Send a test email to verify your email settings are working correctly.</p>
            <div className="test-email-group">
              <input
                type="email"
                placeholder="Enter test email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="test-email-input"
              />
              <button 
                className="btn-test" 
                onClick={sendTestEmail}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>

          {/* Feature Overview */}
          <div className="features-section">
            <h3>Automated Email Features</h3>
            <div className="feature-list">
              <div className="feature-item">
                <MdWarning className="feature-icon" />
                <div>
                  <strong>Overdue Rent Alerts</strong>
                  <p>Automatically notify you when tenants have overdue rent payments</p>
                </div>
              </div>
              <div className="feature-item">
                <MdSchedule className="feature-icon" />
                <div>
                  <strong>Rent Reminders</strong>
                  <p>Send automatic reminders to tenants before rent is due</p>
                </div>
              </div>
              <div className="feature-item">
                <MdBuild className="feature-icon" />
                <div>
                  <strong>Maintenance Alerts</strong>
                  <p>Get notified immediately when tenants submit maintenance requests</p>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="setup-section">
            <h3>Setup Required</h3>
            <p>To use email automation, configure your email settings in the backend:</p>
            <ol>
              <li>Create a <code>.env</code> file in the <code>chatbot-backend</code> directory</li>
              <li>Add your email configuration (see EMAIL_AUTOMATION_SETUP.md)</li>
              <li>Restart the backend server</li>
              <li>Test your configuration using the test email feature above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAutomation; 