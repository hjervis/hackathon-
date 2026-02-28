import asyncio
import websockets
import json

# starting location - Clemson University main campus near Sikes Hall
start_lat = 34.6794
start_lng = -82.8351

async def simulate_movement():
    async with websockets.connect('ws://127.0.0.1:8000/ws/user1') as ws:
        print("Connected! Simulating movement across Clemson campus...")
        
        lat = start_lat
        lng = start_lng
        
        # send 20 location updates, moving slightly each time
        for i in range(20):
            # move slightly to simulate walking across campus
            lat += 0.0001
            lng += 0.0001
            
            await ws.send(json.dumps({
                "type": "location_update",
                "lat": lat,
                "lng": lng
            }))
            
            print(f"Step {i+1}/20: Moving to {lat:.4f}, {lng:.4f}")
            
            # wait 2 seconds between updates to simulate real movement
            await asyncio.sleep(2)
        
        print("Simulation complete!")

asyncio.run(simulate_movement())