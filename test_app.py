
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://127.0.0.1:8000/ws/orchestrator"
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to {uri}")
            
            # Send a simple prompt
            test_prompt = {"prompt": "Create a simple HTML button that changes its color to red when clicked."}
            await websocket.send(json.dumps(test_prompt))
            print(f"Sent: {test_prompt}")

            # Listen for responses (up to 30 seconds)
            try:
                while True:
                    response = await asyncio.wait_for(websocket.recv(), timeout=30.0)
                    data = json.loads(response)
                    
                    # Print logs or code updates
                    if "type" in data:
                        print(f"[{data.get('type')}] {data.get('content') or data.get('log', '')[:100]}...")
                    else:
                        print(f"Received: {str(data)[:100]}...")
                        
                    # Break if we get a completion signal or just enough output
                    if data.get("type") == "completion" or "Final code" in str(data):
                        break
            except asyncio.TimeoutError:
                print("Test timed out waiting for response.")
                
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
