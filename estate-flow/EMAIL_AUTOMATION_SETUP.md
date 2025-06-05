# Email Automation Setup Guide

## Overview
The EstateFlow automated email system sends notifications for:
- **Overdue rent payments** (to landlord)
- **Rent reminders** (to tenants)
- **Maintenance requests** (to landlord)

## Quick Setup

### 1. Email Configuration

Create a `.env` file in the `chatbot-backend` directory with your email settings:

```env
# Email Configuration
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password
LANDLORD_EMAIL=landlord@example.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

### 2. Gmail Setup (Recommended)

For Gmail, you'll need to create an **App Password**:

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings → Security → App passwords
3. Generate a new app password for "Mail"
4. Use this app password (not your regular password) in `SENDER_PASSWORD`

### 3. Install Dependencies

```bash
cd chatbot-backend
pip install -r requirements.txt
```

### 4. Start the Backend

```bash
python app.py
```

## Features

### Automated Schedule
- **Daily Check**: 9:00 AM (configurable)
- **Rent Reminders**: 3 days and 1 day before due date
- **Grace Period**: 3 days after due date before overdue notices
- **Due Date**: Assumes rent is due on the 1st of each month

### Email Types

#### 1. Overdue Rent Notifications (to Landlord)
Automatically sent when tenants haven't marked rent as paid after grace period.

**Includes:**
- List of overdue tenants
- Amount owed per tenant
- Days overdue
- Contact information
- Summary totals

#### 2. Rent Reminders (to Tenants)
Sent automatically before rent is due.

**Includes:**
- Property and unit details
- Rent amount
- Due date
- Professional reminder message

#### 3. Maintenance Requests (to Landlord)
Triggered when maintenance requests are submitted.

**Includes:**
- Property and unit details
- Tenant contact information
- Issue description
- Priority level

## API Endpoints

### Start Automated Scheduler
```bash
POST http://localhost:5001/scheduler/start
```

### Stop Scheduler
```bash
POST http://localhost:5001/scheduler/stop
```

### Check Scheduler Status
```bash
GET http://localhost:5001/scheduler/status
```

### Manual Rent Check
```bash
POST http://localhost:5001/scheduler/manual-check
```

### Test Email Configuration
```bash
POST http://localhost:5001/email/test
Content-Type: application/json

{
  "email": "test@example.com"
}
```

## Frontend Integration

You can add email management controls to your React dashboard:

```javascript
// Start scheduler
const startScheduler = async () => {
  const response = await fetch('http://localhost:5001/scheduler/start', {
    method: 'POST'
  });
  const data = await response.json();
  console.log(data.message);
};

// Check status
const checkStatus = async () => {
  const response = await fetch('http://localhost:5001/scheduler/status');
  const data = await response.json();
  console.log(data.status);
};

// Test email
const testEmail = async () => {
  const response = await fetch('http://localhost:5001/email/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'your-email@example.com' })
  });
  const data = await response.json();
  console.log(data.message);
};
```

## Configuration Options

### Scheduler Settings
Edit `scheduler_service.py` to customize:

```python
class RentScheduler:
    def __init__(self):
        self.check_overdue_time = "09:00"  # Daily check time
        self.reminder_days_before = [3, 1]  # Days before due date
        self.grace_period_days = 3  # Days after due date
```

### Email Templates
Customize email templates in `email_service.py`:
- Modify HTML styling
- Change email content
- Add your branding

## Data Requirements

The system expects property data in this format:

```json
[
  {
    "name": "Property Name",
    "address": "123 Main St",
    "units": [
      {
        "number": "101",
        "rent": 1500,
        "rentPaid": false,
        "tenant": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "(555) 123-4567"
        }
      }
    ]
  }
]
```

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check if you're using an app password (not regular password)
   - Verify 2FA is enabled on Gmail

2. **"SMTP connection failed"**
   - Check SMTP server and port settings
   - Ensure firewall allows SMTP connections

3. **"No overdue tenants found"**
   - Verify `rentPaid` field is set correctly
   - Check date calculations in scheduler

4. **Emails not sending**
   - Test email configuration first
   - Check logs for detailed error messages

### Testing

1. **Test Email Configuration:**
```bash
curl -X POST http://localhost:5001/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

2. **Manual Rent Check:**
```bash
curl -X POST http://localhost:5001/scheduler/manual-check
```

3. **Check Scheduler Status:**
```bash
curl http://localhost:5001/scheduler/status
```

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords instead of regular passwords
- Consider using environment variables for production
- Regularly rotate your app passwords

## Production Deployment

For production deployment:

1. Use a proper email service (SendGrid, Mailgun, etc.)
2. Set up proper logging and monitoring
3. Use environment variables instead of `.env` files
4. Configure proper error handling and retries
5. Set up email rate limiting

## Support

If you encounter issues:
1. Check the logs in the terminal
2. Test email configuration first
3. Verify your property data format
4. Ensure all environment variables are set correctly 