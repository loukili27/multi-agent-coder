import os
import sys

# Add the current directory to sys.path to allow absolute imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json

from orchestrator import Orchestrator

app = FastAPI(title="Multi-Agent Coder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.websocket("/ws/orchestrator")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print(f"WebSocket connection accepted from {websocket.client}")
    orchestrator = Orchestrator(websocket=websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received message: {data}")
            message = json.loads(data)
            prompt = message.get("prompt")
            if prompt:
                print(f"Starting orchestrator for prompt: {prompt}")
                await orchestrator.run(prompt)
                print("Orchestrator run completed")
    except WebSocketDisconnect:
        print(f"Client disconnected: {websocket.client}")
    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
