from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from Controllers.auth import router as auth_router
from dotenv import load_dotenv
from typing import Dict
from twilio_service import send_emergency_sms
import os

# Load environment variables
load_dotenv()

# Create FastAPI instance
app = FastAPI(title="Public Safety App")

# Include authentication routes
app.include_router(auth_router)

# Enable CORS so frontend can communicate with backend
origins = [
    "http://localhost:3000",  # your frontend dev URL
    "http://127.0.0.1:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dictionary to keep track of currently connected clients
clients: Dict[str, WebSocket] = {}

# Root endpoint to verify backend is running
@app.get("/")
async def root():
    return {"message": "Backend is running!"}


# Tracking page (for testing HTML map)
@app.get("/track/{user_id}", response_class=HTMLResponse)
async def tracking_page(user_id: str):
    with open("track.html", "r") as f:
        return f.read()


# WebSocket endpoint for location updates and emergency alerts
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, token: str = Query(None)):
    await websocket.accept()  # accept incoming connection
    clients[client_id] = websocket

    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "location_update":
                # Forward location to all other connected clients
                for cid, ws in clients.items():
                    if cid != client_id:
                        await ws.send_json({
                            "type": "location_update",
                            "id": client_id,
                            "lat": data["lat"],
                            "lng": data["lng"],
                        })

            elif message_type == "emergency_alert":
                # Trigger SMS via Twilio
                send_emergency_sms(
                    to_number=data["emergency_contact"],
                    user_name=data["user_name"],
                    lat=data["lat"],
                    lng=data["lng"],
                    user_id=client_id
                )

    except WebSocketDisconnect:
        # Remove client on disconnect
        del clients[client_id]

        # Notify remaining clients
        for ws in clients.values():
            await ws.send_json({"id": client_id, "left": True})