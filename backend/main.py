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

import asyncio

@app.websocket("/ws/orchestrator")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print(f"WebSocket connection accepted from {websocket.client}")
    orchestrator = Orchestrator(websocket=websocket)
    current_task = None
    
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Received message: {data}")
            message = json.loads(data)
            
            action = message.get("action")
            msg_type = message.get("type", "prompt")
            
            if action == "cancel":
                if current_task and not current_task.done():
                    current_task.cancel()
                    await orchestrator.log("System", "Process cancelled by user.", "system")
                    await orchestrator.send_progress(0, "Cancelled")
                continue

            prompt = message.get("prompt")
            # If refinement, use feedback as prompt
            if msg_type == "refine":
                prompt = message.get("feedback")
                
            language = message.get("language", "TypeScript")
            framework = message.get("framework", "None")
            project_type = message.get("project_type", "Script")
            
            if prompt:
                if current_task and not current_task.done():
                    current_task.cancel()
                
                is_refinement = (msg_type == "refine")
                print(f"Starting orchestrator for prompt: {prompt} (Stack: {language} + {framework} + {project_type}, Refinement: {is_refinement})")
                current_task = asyncio.create_task(orchestrator.run(prompt, language, framework, project_type, is_refinement=is_refinement))
                
    except WebSocketDisconnect:
        if current_task:
            current_task.cancel()
        print(f"Client disconnected: {websocket.client}")
    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
