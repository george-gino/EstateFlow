import schedule
import time
import threading
from datetime import datetime, timedelta
import json
import os
from typing import List, Dict
import logging
from email_service import email_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RentScheduler:
    def __init__(self, data_file_path="properties_data.json"):
        self.data_file_path = data_file_path
        self.running = False
        self.scheduler_thread = None
        
        # Schedule configurations
        self.check_overdue_time = "09:00"  # Check at 9 AM daily
        self.reminder_days_before = [3, 1]  # Send reminders 3 and 1 days before due date
        self.grace_period_days = 3  # Days after due date before sending overdue notices
        
    def load_properties_data(self) -> List[Dict]:
        """Load properties data from JSON file"""
        try:
            if os.path.exists(self.data_file_path):
                with open(self.data_file_path, 'r') as file:
                    return json.load(file)
            else:
                logger.warning(f"Properties data file not found: {self.data_file_path}")
                return []
        except Exception as e:
            logger.error(f"Error loading properties data: {str(e)}")
            return []
    
    def get_overdue_tenants(self) -> List[Dict]:
        """Get list of tenants with overdue rent"""
        properties = self.load_properties_data()
        overdue_tenants = []
        current_date = datetime.now()
        
        for property_data in properties:
            for unit in property_data.get('units', []):
                tenant = unit.get('tenant')
                if not tenant or unit.get('rentPaid', False):
                    continue
                
                # Calculate if rent is overdue
                # Assuming rent is due on the 1st of each month
                this_month_due = datetime(current_date.year, current_date.month, 1)
                if current_date.day < 1:
                    # If we're before the 1st, check last month's rent
                    if current_date.month == 1:
                        this_month_due = datetime(current_date.year - 1, 12, 1)
                    else:
                        this_month_due = datetime(current_date.year, current_date.month - 1, 1)
                
                grace_period_end = this_month_due + timedelta(days=self.grace_period_days)
                
                if current_date > grace_period_end:
                    days_overdue = (current_date - grace_period_end).days
                    
                    overdue_tenants.append({
                        'property_name': property_data.get('name', 'Unknown Property'),
                        'unit_number': unit.get('number', 'N/A'),
                        'tenant_name': tenant.get('name', 'Unknown'),
                        'tenant_email': tenant.get('email', ''),
                        'tenant_phone': tenant.get('phone', ''),
                        'rent': unit.get('rent', 0),
                        'days_overdue': days_overdue,
                        'due_date': this_month_due.strftime('%B 1, %Y')
                    })
        
        return overdue_tenants
    
    def get_tenants_for_reminder(self, days_before: int) -> List[Dict]:
        """Get tenants who should receive rent reminders"""
        properties = self.load_properties_data()
        reminder_tenants = []
        current_date = datetime.now()
        
        # Calculate next month's due date
        if current_date.month == 12:
            next_due_date = datetime(current_date.year + 1, 1, 1)
        else:
            next_due_date = datetime(current_date.year, current_date.month + 1, 1)
        
        reminder_date = next_due_date - timedelta(days=days_before)
        
        # Check if today is a reminder day
        if current_date.date() != reminder_date.date():
            return []
        
        for property_data in properties:
            for unit in property_data.get('units', []):
                tenant = unit.get('tenant')
                if not tenant or unit.get('rentPaid', False):
                    continue
                
                reminder_tenants.append({
                    'property_name': property_data.get('name', 'Unknown Property'),
                    'unit_number': unit.get('number', 'N/A'),
                    'tenant_name': tenant.get('name', 'Unknown'),
                    'tenant_email': tenant.get('email', ''),
                    'tenant_phone': tenant.get('phone', ''),
                    'rent': unit.get('rent', 0),
                    'due_date': next_due_date.strftime('%B 1, %Y')
                })
        
        return reminder_tenants
    
    def check_and_send_overdue_notifications(self):
        """Check for overdue rent and send notifications"""
        try:
            logger.info("Checking for overdue rent payments...")
            overdue_tenants = self.get_overdue_tenants()
            
            if overdue_tenants:
                logger.info(f"Found {len(overdue_tenants)} overdue tenants")
                success = email_service.send_rent_overdue_notification(overdue_tenants)
                if success:
                    logger.info("Overdue rent notification sent successfully")
                else:
                    logger.error("Failed to send overdue rent notification")
            else:
                logger.info("No overdue rent payments found")
                
        except Exception as e:
            logger.error(f"Error checking overdue rent: {str(e)}")
    
    def check_and_send_reminders(self):
        """Check for upcoming rent due dates and send reminders"""
        try:
            for days_before in self.reminder_days_before:
                logger.info(f"Checking for rent reminders ({days_before} days before due)")
                reminder_tenants = self.get_tenants_for_reminder(days_before)
                
                for tenant in reminder_tenants:
                    if tenant.get('tenant_email'):
                        success = email_service.send_rent_reminder_to_tenant(tenant)
                        if success:
                            logger.info(f"Reminder sent to {tenant['tenant_name']}")
                        else:
                            logger.error(f"Failed to send reminder to {tenant['tenant_name']}")
                    else:
                        logger.warning(f"No email address for tenant {tenant['tenant_name']}")
                        
        except Exception as e:
            logger.error(f"Error sending rent reminders: {str(e)}")
    
    def run_daily_checks(self):
        """Run all daily checks"""
        logger.info("Running daily rent checks...")
        self.check_and_send_overdue_notifications()
        self.check_and_send_reminders()
    
    def setup_schedule(self):
        """Setup the schedule for automated checks"""
        # Daily check for overdue rent and reminders
        schedule.every().day.at(self.check_overdue_time).do(self.run_daily_checks)
        
        # You can add more schedules here:
        # schedule.every().monday.at("10:00").do(self.weekly_summary)
        # schedule.every().month.do(self.monthly_report)
        
        logger.info(f"Scheduler configured to run daily at {self.check_overdue_time}")
    
    def start_scheduler(self):
        """Start the scheduler in a separate thread"""
        if self.running:
            logger.warning("Scheduler is already running")
            return
        
        self.setup_schedule()
        self.running = True
        
        def run_scheduler():
            logger.info("Rent scheduler started")
            while self.running:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
            logger.info("Rent scheduler stopped")
        
        self.scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        self.scheduler_thread.start()
        logger.info("Scheduler thread started")
    
    def stop_scheduler(self):
        """Stop the scheduler"""
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        schedule.clear()
        logger.info("Scheduler stopped")
    
    def run_manual_check(self):
        """Manually trigger a check (for testing)"""
        logger.info("Running manual rent check...")
        self.run_daily_checks()
    
    def get_schedule_status(self) -> Dict:
        """Get current scheduler status"""
        return {
            'running': self.running,
            'next_run': str(schedule.next_run()) if schedule.jobs else None,
            'check_time': self.check_overdue_time,
            'grace_period_days': self.grace_period_days,
            'reminder_days_before': self.reminder_days_before,
            'scheduled_jobs': len(schedule.jobs)
        }

# Global scheduler instance
rent_scheduler = RentScheduler()

# Functions for external use
def start_rent_scheduler():
    """Start the rent scheduler"""
    rent_scheduler.start_scheduler()

def stop_rent_scheduler():
    """Stop the rent scheduler"""
    rent_scheduler.stop_scheduler()

def manual_rent_check():
    """Manually trigger a rent check"""
    rent_scheduler.run_manual_check()

def get_scheduler_status():
    """Get scheduler status"""
    return rent_scheduler.get_schedule_status() 