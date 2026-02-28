from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from Controllers import trusted_contactsController, location_sessionController
from Controllers.auth import router as auth_router
from Services import location_sessionService, trusted_contactsService
from Services import locationService
from Services.auth_service import decode_access_token
from twilio_service import send_emergency_sms, send_location_share_sms
from Models.user import User
from dotenv import load_dotenv
from typing import Dict
import os
from Database.database import SessionLocal

# Load environment variables
load_dotenv()

# Create FastAPI instance
app = FastAPI(title="Public Safety App")

from Database.database import engine, Base

# import ALL models so SQLAlchemy knows about them
from Models import user
from Models import trusted_contacts
from Models import location_sessions
from Models import location

# Create tables in the DB if they don't exist
Base.metadata.create_all(bind=engine)

# Include authentication routes
app.include_router(auth_router)
app.include_router(trusted_contactsController.router)
app.include_router(location_sessionController.router)

# Enable CORS so frontend can communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dictionary to keep track of currently connected clients
clients: Dict[int, WebSocket] = {}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Backend is running!"}

# Tracking page for testing
@app.get("/track/{user_id}", response_class=HTMLResponse)
async def tracking_page(user_id: str):
    with open("track.html", "r") as f:
        return f.read()

# WebSocket endpoint
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, token: str = Query(None)):
    await websocket.accept()
    print(f"[WebSocket] Connection attempt from client_id={client_id}, token={'present' if token else 'missing'}")
    
    # Authenticate
    payload = decode_access_token(token or "")
    print("[WebSocket] Token payload:", payload)
    if not payload or "id" not in payload:
        await websocket.send_json({"error": "Auth failed"})
        await websocket.close(code=1008)
        return
    
    user_id = int(payload["id"])
    if user_id != int(client_id):
        await websocket.send_json({"error": "Client ID mismatch"})
        await websocket.close(code=1008)
        return

    clients[user_id] = websocket
    db = SessionLocal()
    print(f"[WebSocket] User {user_id} connected")

    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")
            print(f"[WebSocket] Received {message_type} from user {user_id}: {data}")

            if message_type == "start_session":
                session = location_sessionService.createLocationsession(db, user_id)
                await websocket.send_json({"type": "session_started", "session_id": session.id})

                user = db.query(User).filter(User.id == user_id).first()
                contact_ids = trusted_contactsService.get_accepted_contact_ids(db, user_id)

                for cid in contact_ids:
                    ws = clients.get(cid)
                    if ws:
                        await ws.send_json({"type": "contact_started", "user_id": user_id})
                    
                    contact = db.query(User).filter(User.id == cid).first()
                    if contact and contact.phone:
                        send_location_share_sms(
                            to_number=contact.phone,
                            user_name=user.username,
                            user_id=user_id
                        )

            elif message_type == "end_session":
                sid = data.get("session_id")
                if sid is not None:
                    location_sessionService.end_session(db, user_id, sid)
                await websocket.send_json({"type": "session_ended", "session_id": sid})

                contact_ids = trusted_contactsService.get_accepted_contact_ids(db, user_id)
                for cid in contact_ids:
                    ws = clients.get(cid)
                    if ws:
                        await ws.send_json({"type": "contact_ended", "user_id": user_id})

            elif message_type == "location_update":
                lat = data.get("lat")
                lng = data.get("lng")
                acc = data.get("accuracy")
                try:
                    locationService.save_location(db, user_id, lat, lng, acc)
                except Exception as e:
                    print(f"[WebSocket] Error saving location: {e}")

                contact_ids = trusted_contactsService.get_accepted_contact_ids(db, user_id)
                for cid in contact_ids:
                    ws = clients.get(cid)
                    if ws:
                        await ws.send_json({
                            "type": "location_update",
                            "id": user_id,
                            "lat": lat,
                            "lng": lng,
                        })

            elif message_type == "emergency_alert":
                user = db.query(User).filter(User.id == user_id).first()
                lat = data.get("lat")
                lng = data.get("lng")

                # Send emergency SMS to user
                if user and user.phone:
                    send_emergency_sms(
                        to_number=user.phone,
                        user_name=user.username,
                        lat=lat,
                        lng=lng,
                        user_id=user_id,
                    )

                contact_ids = trusted_contactsService.get_accepted_contact_ids(db, user_id)
                for cid in contact_ids:
                    contact = db.query(User).filter(User.id == cid).first()
                    if contact and contact.phone:
                        send_emergency_sms(
                            to_number=contact.phone,
                            user_name=user.username,
                            lat=lat,
                            lng=lng,
                            user_id=user_id,
                        )

    except WebSocketDisconnect:
        print(f"[WebSocket] User {user_id} disconnected")
        if user_id in clients:
            del clients[user_id]
        for ws in clients.values():
            await ws.send_json({"id": user_id, "left": True})
    finally:
        db.close()