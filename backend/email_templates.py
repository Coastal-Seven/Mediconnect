from enum import Enum
from typing import Dict, Any, Optional
from datetime import datetime

class EmailTemplate(str, Enum):
    """Enum for different email template types"""
    APPOINTMENT_CONFIRMATION = "appointment_confirmation"
    APPOINTMENT_REMINDER = "appointment_reminder"
    APPOINTMENT_CANCELLATION = "appointment_cancellation"
    APPOINTMENT_RESCHEDULED = "appointment_rescheduled"
    WELCOME = "welcome"
    PASSWORD_RESET = "password_reset"

def get_email_subject(template_type: EmailTemplate) -> str:
    """Returns the appropriate subject line based on the template type"""
    subjects = {
        EmailTemplate.APPOINTMENT_CONFIRMATION: "Your Appointment Confirmation",
        EmailTemplate.APPOINTMENT_REMINDER: "Reminder: Your Upcoming Appointment",
        EmailTemplate.APPOINTMENT_CANCELLATION: "Your Appointment Has Been Cancelled",
        EmailTemplate.APPOINTMENT_RESCHEDULED: "Your Appointment Has Been Rescheduled",
        EmailTemplate.WELCOME: "Welcome to Smart Care!",
        EmailTemplate.PASSWORD_RESET: "Password Reset Request"
    }
    return subjects.get(template_type, "Smart Care Notification")

def format_appointment_time(appointment_time) -> str:
    """Formats the appointment time in a user-friendly way"""
    # Handle both datetime objects and string formats
    if isinstance(appointment_time, datetime):
        return appointment_time.strftime("%A, %B %d, %Y at %I:%M %p")
    elif isinstance(appointment_time, str):
        try:
            # Try to parse the string into a datetime object
            dt = datetime.strptime(appointment_time, "%Y-%m-%d %H:%M")
            return dt.strftime("%A, %B %d, %Y at %I:%M %p")
        except ValueError:
            # If parsing fails, return the original string
            return appointment_time
    else:
        # For any other type, convert to string
        return str(appointment_time)

def get_appointment_confirmation_template(data: Dict[str, Any]) -> str:
    """Returns the plain text content for the appointment confirmation email"""
    appointment_time = format_appointment_time(data['appointment_time'])
    
    return f"""
Hello {data['user_name']},

Your appointment has been successfully booked. Here are the details:

Appointment Details:
- Provider: {data['provider_name']}
- Location: {data['provider_location']}
- Date & Time: {appointment_time}

Your Information Summary:
- Name: {data['user_name']}
- Email: {data['user_email']}
- Phone: {data.get('user_phone', 'Not provided')}
- Symptoms: {data.get('symptoms', 'Not provided')}
- Symptom Duration: {data.get('duration', 'Not provided')}
- Description: {data.get('description', 'Not provided')}

If you need to cancel or reschedule, please do so through your dashboard.
Thank you for using our service!

© {datetime.now().year} Smart Care. All rights reserved.
    """

def get_appointment_reminder_template(data: Dict[str, Any]) -> str:
    """Returns the plain text content for the appointment reminder email"""
    appointment_time = format_appointment_time(data['appointment_time'])
    
    return f"""
Hello {data['user_name']},

This is a friendly reminder about your upcoming appointment:

Appointment Details:
- Provider: {data['provider_name']}
- Location: {data['provider_location']}
- Date & Time: {appointment_time}

Please arrive 15 minutes before your scheduled time. If you need to cancel or reschedule, please do so at least 24 hours in advance.

Thank you for choosing Smart Care!

© {datetime.now().year} Smart Care. All rights reserved.
    """

def get_appointment_cancellation_template(data: Dict[str, Any]) -> str:
    """Returns the plain text content for the appointment cancellation email"""
    appointment_time = format_appointment_time(data['appointment_time'])
    
    return f"""
Hello {data['user_name']},

Your appointment has been cancelled as requested. Here are the details of the cancelled appointment:

Appointment Details:
- Provider: {data['provider_name']}
- Location: {data['provider_location']}
- Date & Time: {appointment_time}

If you would like to schedule a new appointment, please visit our website or app.

Thank you for using Smart Care!

© {datetime.now().year} Smart Care. All rights reserved.
    """

def get_appointment_rescheduled_template(data: Dict[str, Any]) -> str:
    """Returns the plain text content for the appointment rescheduled email"""
    # Use new_appointment_time and old_appointment_time fields
    new_appointment_time = format_appointment_time(data['new_appointment_time']) if 'new_appointment_time' in data else "Not available"
    old_appointment_time = format_appointment_time(data['old_appointment_time']) if 'old_appointment_time' in data else "Not available"
    
    return f"""
Hello {data['user_name']},

Your appointment has been rescheduled. Here are the updated details:

New Appointment Details:
- Provider: {data['provider_name']}
- Location: {data['provider_location']}
- New Date & Time: {new_appointment_time}
- Previous Time: {old_appointment_time}

If you need to make any further changes, please do so through your dashboard.

Thank you for using Smart Care!

© {datetime.now().year} Smart Care. All rights reserved.
    """

def get_welcome_template(data: Dict[str, Any]) -> str:
    """Returns the plain text content for the welcome email"""
    return f"""
Hello {data['user_name']},

Thank you for registering with Smart Care. We're excited to help you find the right healthcare providers for your needs.

Getting Started:
Here are a few things you can do with Smart Care:
- Fill out your health profile to get personalized provider recommendations
- Search for healthcare providers based on your symptoms and insurance
- Book appointments with just a few clicks
- Get AI-generated care tips and recommendations

If you have any questions or need assistance, please don't hesitate to contact our support team.
We're glad to have you on board!

© {datetime.now().year} Smart Care. All rights reserved.
    """

def get_password_reset_template(data: Dict[str, Any]) -> str:
    """Returns the plain text content for the password reset email"""
    return f"""
Hello {data['user_name']},

We received a request to reset your password. If you didn't make this request, you can safely ignore this email.

To reset your password, please use the following link:
{data['reset_link']}

This link will expire in 1 hour for security reasons.

© {datetime.now().year} Smart Care. All rights reserved.
    """

def get_email_content(data: Dict[str, Any], template_type: Optional[EmailTemplate] = None) -> str:
    """Returns the plain text content for the specified email template type"""
    # Default to appointment confirmation for backward compatibility
    if template_type is None:
        template_type = EmailTemplate.APPOINTMENT_CONFIRMATION
    
    template_functions = {
        EmailTemplate.APPOINTMENT_CONFIRMATION: get_appointment_confirmation_template,
        EmailTemplate.APPOINTMENT_REMINDER: get_appointment_reminder_template,
        EmailTemplate.APPOINTMENT_CANCELLATION: get_appointment_cancellation_template,
        EmailTemplate.APPOINTMENT_RESCHEDULED: get_appointment_rescheduled_template,
        EmailTemplate.WELCOME: get_welcome_template,
        EmailTemplate.PASSWORD_RESET: get_password_reset_template
    }
    
    template_function = template_functions.get(template_type, get_appointment_confirmation_template)
    return template_function(data)

# For backward compatibility
def get_html_content(data: Dict[str, Any], template_type: Optional[EmailTemplate] = None) -> str:
    """Alias for get_email_content for backward compatibility"""
    return get_email_content(data, template_type)