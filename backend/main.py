from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict


app = FastAPI()

# Dictionary that will keep track of currently connected clients
clients: Dict[str, WebSocket] = {}


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id : str):
    
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