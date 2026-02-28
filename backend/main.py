from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from typing import Dict
from dotenv import load_dotenv
from twilio.rest import Client
import httpx
import os

# loads environemnt variables
load_dotenv()

app = FastAPI()

# Dictionary that will keep track of currently connected clients
clients: Dict[str, WebSocket] = {}
responders: Dict[str, WebSocket] = {}

# Load Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Creatimg twlio client
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_message_sms(to_number: str, user_name: str, lat: float, lng: float):
    maps_link = f"https://maps.google.com/?q={lat},{lng}"

    message = twilio_client.messages.create(
        body = (
            f"🚨 EMERGENCY ALERT\n"
            f"{user_name} has triggered an emergency. \n"
            f"Current location: {maps_link}\n"
        ),
        from_=TWILIO_PHONE_NUMBER,
        to=to_number
    )
    return message.sid

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    client_id : str,
    token: str = Query(None)
    ):
    
        # accept incoming wwebsocket connection
        await websocket.accept()

        # stores client connections
        clients[client_id] = websocket

        try:
            while True:
                # Wait for client to send location
                data = await websocket.receive_json()

                # Forwards location
                for cid, ws in clients.items():
                    if cid!= client_id:
                        await ws.send_json({
                            "id": client_id,
                            "lat": data["lat"],
                            "lng": data["lng"],
                        })
    
        # raised as soon as client disconnects 
        except WebSocketDisconnect:
            del clients[client_id]

            for ws in clients.values():
                await ws.send_json({"id": client_id, "left": True})