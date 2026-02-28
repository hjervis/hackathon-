from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from typing import Dict
from dotenv import load_dotenv
from twilio_service import send_emergency_sms
import os

# loads environemnt variables
load_dotenv()

app = FastAPI()

# Dictionary that will keep track of currently connected clients
clients: Dict[str, WebSocket] = {}

@app.get("/track/{user_id}", response_class=HTMLResponse)
async def tracking_page(user_id: str):
    with open("track.html", "r") as f:
        return f.read()

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
            message_type = data.get("type")

            if message_type == "location_update":

                # Forwards location
                for cid, ws in clients.items():
                    if cid!= client_id:
                        await ws.send_json({
                            "type": "location_update",
                            "id": client_id,
                            "lat": data["lat"],
                            "lng": data["lng"],
                        })
            elif message_type == "emergency_alert":
                send_emergency_sms(
                    to_number=data["emergency_contact"],
                    user_name=data["user_name"],
                    lat=data["lat"],
                    lng=data["lng"],
                    user_id=client_id
                )
    
    # raised as soon as client disconnects 
    except WebSocketDisconnect:
        del clients[client_id]

        for ws in clients.values():
            await ws.send_json({"id": client_id, "left": True})