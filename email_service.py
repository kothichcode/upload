import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

async def send_verification_email(user_email: str, user_id: str):
    message = MIMEMultipart()
    message["From"] = settings.SMTP_USER
    message["To"] = user_email
    message["Subject"] = "Verify your Weather App account"
    
    verification_link = f"http://localhost:3000/verify/{user_id}"
    
    body = f"""
    <html>
    <body>
        <h2>Welcome to Weather App!</h2>
        <p>Please click the link below to verify your account:</p>
        <p><a href="{verification_link}">Verify Account</a></p>
        <p>If you didn't create this account, please ignore this email.</p>
    </body>
    </html>
    """
    
    message.attach(MIMEText(body, "html"))
    
    try:
        smtp = aiosmtplib.SMTP(hostname=settings.SMTP_HOST, port=settings.SMTP_PORT)
        await smtp.connect()
        await smtp.starttls()
        await smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        await smtp.send_message(message)
        await smtp.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False