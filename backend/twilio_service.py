from twilio.rest import Client
from dotenv import load_dotenv
import os

# loads environemnt variables
load_dotenv()

# Load Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Creatimg twlio client
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

SERVER_URL = os.getenv("SERVER_URL")

def send_emergency_sms(to_number: str, user_name: str, lat: float, lng: float, user_id: str):
    tracking_link = f"{SERVER_URL}/track/{user_id}"

    try:
        message = twilio_client.messages.create(
            body=(
                f"🚨 EMERGENCY ALERT\n"
                f"{user_name} has triggered an emergency alert.\n\n"
                f"Track their live location here:\n"
                f"{tracking_link}\n\n"
            ),
            from_=f"whatsapp:{TWILIO_PHONE_NUMBER}",
            to=f"whatsapp:{to_number}"
        )
        print(f"WhatsApp message sent successfully! SID: {message.sid}")
        return message.sid
    except Exception as e:
        print(f"Error sending WhatsApp Message: {e}")
        return None
