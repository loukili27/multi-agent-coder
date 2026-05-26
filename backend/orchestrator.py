from typing import List, Dict, Any, Optional
from agents.specialized import Architect, Developer, Reviewer
import json

class Orchestrator:
    def __init__(self, websocket=None):
        self.architect = Architect()
        self.developer = Developer()
        self.reviewer = Reviewer()
        self.websocket = websocket
        self.history = []

    async def log(self, agent_name: str, content: str, type: str = "chat"):
        message = {
            "agent": agent_name,
            "content": content,
            "type": type
        }
        self.history.append(message)
        if self.websocket:
            await self.websocket.send_text(json.dumps(message))

    async def run(self, prompt: str, max_turns: int = 3):
        await self.log("System", f"Starting task: {prompt}", "system")
        
        # 1. Architect phase
        await self.log("System", "Architect is designing...", "system")
        blueprint = await self.architect.generate_response(prompt)
        await self.log("Architect", blueprint)

        current_code = ""
        for turn in range(max_turns):
            await self.log("System", f"Turn {turn + 1}: Developer is coding...", "system")
            # 2. Developer phase
            dev_prompt = f"Blueprint: {blueprint}\n\nPrevious Feedback: {current_code if turn > 0 else 'None'}\n\nImplement the code."
            current_code = await self.developer.generate_response(dev_prompt)
            await self.log("Developer", current_code, "code")

            # 3. Reviewer phase
            await self.log("System", f"Turn {turn + 1}: Reviewer is checking...", "system")
            review_feedback = await self.reviewer.generate_response(f"Architect's Plan: {blueprint}\n\nDeveloper's Code: {current_code}")
            await self.log("Reviewer", review_feedback)

            if review_feedback.strip().upper().startswith("PASS"):
                await self.log("System", "Task completed successfully!", "system")
                return current_code

        await self.log("System", "Reached maximum turns. Returning latest version.", "system")
        return current_code
