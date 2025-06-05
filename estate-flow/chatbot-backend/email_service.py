import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import os
from typing import List, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.sender_email = os.getenv('SENDER_EMAIL')
        self.sender_password = os.getenv('SENDER_PASSWORD')
        self.landlord_email = os.getenv('LANDLORD_EMAIL')
        
        if not all([self.sender_email, self.sender_password, self.landlord_email]):
            logger.warning("Email credentials not fully configured. Please set SENDER_EMAIL, SENDER_PASSWORD, and LANDLORD_EMAIL environment variables.")
    
    def send_email(self, to_email: str, subject: str, body: str, is_html: bool = False) -> bool:
        """Send an email using SMTP"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.sender_email
            message["To"] = to_email
            
            # Add body to email
            part = MIMEText(body, "html" if is_html else "plain")
            message.attach(part)
            
            # Create secure connection and send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, to_email, message.as_string())
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False
    
    def send_rent_overdue_notification(self, overdue_tenants: List[Dict]) -> bool:
        """Send notification to landlord about overdue rent"""
        if not overdue_tenants:
            return True
            
        subject = f"🚨 Rent Payment Alert - {len(overdue_tenants)} Overdue Tenants"
        
        # Create HTML email body
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ background-color: #f44336; color: white; padding: 20px; border-radius: 5px; }}
                .tenant-item {{ background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; border-radius: 5px; }}
                .property-name {{ font-weight: bold; font-size: 16px; color: #2c3e50; }}
                .tenant-details {{ margin: 5px 0; }}
                .amount {{ font-weight: bold; color: #e74c3c; }}
                .summary {{ background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Rent Payment Alert</h2>
                <p>The following tenants have overdue rent payments as of {datetime.now().strftime('%B %d, %Y')}</p>
            </div>
            
            <div class="summary">
                <h3>Summary</h3>
                <p><strong>Total Overdue Tenants:</strong> {len(overdue_tenants)}</p>
                <p><strong>Total Amount Overdue:</strong> ${sum(tenant.get('rent', 0) for tenant in overdue_tenants):,.2f}</p>
            </div>
            
            <h3>Overdue Tenants:</h3>
        """
        
        for tenant in overdue_tenants:
            html_body += f"""
            <div class="tenant-item">
                <div class="property-name">{tenant.get('property_name', 'Unknown Property')} - Unit {tenant.get('unit_number', 'N/A')}</div>
                <div class="tenant-details"><strong>Tenant:</strong> {tenant.get('tenant_name', 'Unknown')}</div>
                <div class="tenant-details"><strong>Email:</strong> {tenant.get('tenant_email', 'Not provided')}</div>
                <div class="tenant-details"><strong>Phone:</strong> {tenant.get('tenant_phone', 'Not provided')}</div>
                <div class="tenant-details amount"><strong>Overdue Amount:</strong> ${tenant.get('rent', 0):,.2f}</div>
                <div class="tenant-details"><strong>Days Overdue:</strong> {tenant.get('days_overdue', 'Unknown')}</div>
            </div>
            """
        
        html_body += """
            <p style="margin-top: 30px;">
                <strong>Next Steps:</strong><br>
                • Contact tenants directly<br>
                • Send formal notices if required<br>
                • Review lease agreements for late fee policies<br>
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This is an automated message from your EstateFlow property management system.
            </p>
        </body>
        </html>
        """
        
        return self.send_email(self.landlord_email, subject, html_body, is_html=True)
    
    def send_rent_reminder_to_tenant(self, tenant_info: Dict) -> bool:
        """Send rent reminder directly to tenant"""
        if not tenant_info.get('tenant_email'):
            logger.warning(f"No email address for tenant {tenant_info.get('tenant_name', 'Unknown')}")
            return False
            
        subject = f"Rent Payment Reminder - {tenant_info.get('property_name', 'Your Unit')}"
        
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }}
                .header {{ background-color: #3498db; color: white; padding: 20px; border-radius: 5px; }}
                .content {{ padding: 20px; }}
                .important {{ background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                .footer {{ color: #666; font-size: 12px; margin-top: 30px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Rent Payment Reminder</h2>
            </div>
            
            <div class="content">
                <p>Dear {tenant_info.get('tenant_name', 'Tenant')},</p>
                
                <p>This is a friendly reminder that your rent payment is due.</p>
                
                <div class="important">
                    <strong>Property Details:</strong><br>
                    Property: {tenant_info.get('property_name', 'N/A')}<br>
                    Unit: {tenant_info.get('unit_number', 'N/A')}<br>
                    Monthly Rent: ${tenant_info.get('rent', 0):,.2f}<br>
                    Due Date: {tenant_info.get('due_date', 'Check your lease')}
                </div>
                
                <p>Please ensure your payment is submitted as soon as possible to avoid any late fees.</p>
                
                <p>If you have already made your payment, please disregard this message. If you have any questions or concerns, please contact us immediately.</p>
                
                <p>Thank you for your prompt attention to this matter.</p>
                
                <p>Best regards,<br>
                Property Management Team</p>
            </div>
            
            <div class="footer">
                This is an automated reminder from your property management system.
            </div>
        </body>
        </html>
        """
        
        return self.send_email(tenant_info['tenant_email'], subject, html_body, is_html=True)
    
    def send_maintenance_request_notification(self, maintenance_request: Dict) -> bool:
        """Send maintenance request notification to landlord"""
        subject = f"🔧 New Maintenance Request - {maintenance_request.get('property_name', 'Unknown Property')}"
        
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ background-color: #f39c12; color: white; padding: 20px; border-radius: 5px; }}
                .request-details {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h2>New Maintenance Request</h2>
                <p>Submitted on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
            </div>
            
            <div class="request-details">
                <h3>Request Details</h3>
                <p><strong>Property:</strong> {maintenance_request.get('property_name', 'N/A')}</p>
                <p><strong>Unit:</strong> {maintenance_request.get('unit_number', 'N/A')}</p>
                <p><strong>Tenant:</strong> {maintenance_request.get('tenant_name', 'N/A')}</p>
                <p><strong>Contact:</strong> {maintenance_request.get('tenant_phone', 'N/A')}</p>
                <p><strong>Issue:</strong> {maintenance_request.get('issue_description', 'No description provided')}</p>
                <p><strong>Priority:</strong> {maintenance_request.get('priority', 'Normal')}</p>
            </div>
            
            <p>Please address this maintenance request promptly.</p>
        </body>
        </html>
        """
        
        return self.send_email(self.landlord_email, subject, html_body, is_html=True)

# Email service instance
email_service = EmailService() 