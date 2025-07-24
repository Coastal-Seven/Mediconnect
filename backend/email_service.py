from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import List, Dict, Any, Optional
import os
import logging
from email_templates import get_email_content, get_email_subject, EmailTemplate

logger = logging.getLogger(__name__)

# Email configuration from environment variables
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=os.getenv("MAIL_TLS", 'True').lower() in ('true', '1', 't'),
    MAIL_SSL_TLS=os.getenv("MAIL_SSL", 'False').lower() in ('true', '1', 't'),
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_email(
    recipients: List[EmailStr], 
    data: Dict[str, Any], 
    template_type: EmailTemplate = EmailTemplate.APPOINTMENT_CONFIRMATION,
    subject: Optional[str] = None
):
    """
    Send an email using the specified template type.
    
    Args:
        recipients: List of email addresses to send to
        data: Dictionary containing the data needed for the email template
        template_type: The type of email template to use
        subject: Optional custom subject line (if not provided, a default based on template_type will be used)
    """
    try:
        # Use provided subject or get default based on template type
        email_subject = subject if subject else get_email_subject(template_type)
        
        # Create the message
        message = MessageSchema(
            subject=email_subject,
            recipients=recipients,
            body=get_email_content(data, template_type),
            subtype="plain"
        )

        # Send the email
        fm = FastMail(conf)
        await fm.send_message(message)
        logger.info(f"Email sent successfully to {', '.join(recipients)} using template {template_type}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

# For backward compatibility
async def send_confirmation_email(recipients: List[EmailStr], data: Dict[str, Any]):
    """
    Send a confirmation email for an appointment booking.
    This is a convenience function that calls send_email with the APPOINTMENT_CONFIRMATION template.
    """
    return await send_email(recipients, data, EmailTemplate.APPOINTMENT_CONFIRMATION)

# Example of a simpler direct email function similar to Django example
async def send_appointment_email(appointment):
    """
    Send a simple appointment confirmation email directly.
    
    Args:
        appointment: An object containing email, name, date, and time attributes
    """
    try:
        fm = FastMail(conf)
        message = MessageSchema(
            subject="Your Appointment Confirmation",
            recipients=[appointment.email],
            body=f"""
Hi {appointment.name},

Your appointment is confirmed on {appointment.date} at {appointment.time}.

Thank you!
""",
            subtype="plain"
        )
        await fm.send_message(message)
        logger.info(f"Direct appointment email sent to {appointment.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send direct appointment email: {str(e)}")
        return False

async def send_reminder_email(recipients: List[EmailStr], data: Dict[str, Any]):
    """
    Send a reminder email for an upcoming appointment.
    """
    return await send_email(recipients, data, EmailTemplate.APPOINTMENT_REMINDER)

async def send_cancellation_email(recipients: List[EmailStr], data: Dict[str, Any]):
    """
    Send a cancellation email for a cancelled appointment.
    """
    return await send_email(recipients, data, EmailTemplate.APPOINTMENT_CANCELLATION)

async def send_rescheduled_email(recipients: List[EmailStr], data: Dict[str, Any]):
    """
    Send an email notification for a rescheduled appointment.
    """
    return await send_email(recipients, data, EmailTemplate.APPOINTMENT_RESCHEDULED)

async def send_welcome_email(recipients: List[EmailStr], data: Dict[str, Any]):
    """
    Send a welcome email to newly registered users.
    """
    return await send_email(recipients, data, EmailTemplate.WELCOME)

async def send_password_reset_email(recipients: List[EmailStr], data: Dict[str, Any]):
    """
    Send a password reset email with a reset link.
    """
    return await send_email(recipients, data, EmailTemplate.PASSWORD_RESET)