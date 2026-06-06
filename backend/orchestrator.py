from typing import List, Dict, Any, Optional
from agents import AgentRegistry
from schemas import Memory
import json
import asyncio

class Orchestrator:
    def __init__(self, websocket=None):
        self.websocket = websocket
        self.memory = Memory()
        self.forbidden_patterns = [
            "pass", "TODO", "NotImplemented", "implement logic", 
            "placeholder", "your code here", "omitted for brevity", "..."
        ]

    async def log(self, agent_name: str, content: str, type: str = "chat"):
        message = {
            "type": "log",
            "agent": agent_name,
            "content": content,
            "log_type": type,
            "status": "running"
        }
        self.memory.add_log(agent_name, content, type)
        if self.websocket:
            await self.websocket.send_text(json.dumps(message))

    def _check_code_quality(self, code: str) -> Optional[str]:
        """Check for forbidden placeholder patterns in the code."""
        found = []
        for pattern in self.forbidden_patterns:
            if pattern.lower() in code.lower():
                found.append(f"Found placeholder pattern: '{pattern}'")
        return "\n".join(found) if found else None

    async def run(self, prompt: str, language: str, framework: str = "None", project_type: str = "Script", is_refinement: bool = False):
        try:
            if not is_refinement:
                self.memory.reset_for_new_task(prompt, language, framework, project_type)
            else:
                self.memory.refinement_history.append(prompt)
                await self.log("System", f"Refinement requested: {prompt}", "system")

            # Stack Validation
            incompatible = False
            if language == "C++" and framework in ["React", "Next.js", "Vue", "Express", "NestJS"]:
                incompatible = True
            elif language == "Java" and framework in ["React", "Next.js", "Vue", "Express", "NestJS", "FastAPI", "Flask"]:
                incompatible = True
            elif language == "SQL" and framework not in ["PostgreSQL", "MySQL", "SQLite", "None"]:
                incompatible = True
            
            if incompatible:
                await self.log("System", f"Validation Error: {framework} is not compatible with {language}.", "system")
                await self.send_progress(0, "Invalid Stack")
                return None

            # Initialize agents from registry
            architect = AgentRegistry.get_agent("Architect")
            developer = AgentRegistry.get_agent("Developer")
            reviewer = AgentRegistry.get_agent("Reviewer")

            if not all([architect, developer, reviewer]):
                raise ValueError("One or more required agents are not registered.")

            if not is_refinement:
                await self.log("System", f"Task received: {prompt}", "system")
                await self.send_progress(1, "Task received")
                
                # 1. Architect phase
                await self.send_progress(2, "Architect planning")
                stack_info = f"Language: {language}, Framework: {framework}, Project Type: {project_type}"
                await self.log("System", f"Architect is planning for {stack_info}...", "system")
                arch_prompt = f"Target Stack: {stack_info}\nRequest: {prompt}"
                self.memory.architecture_plan = await architect.generate_response(arch_prompt)
                await self.log("Architect", self.memory.architecture_plan)
            else:
                stack_info = f"Language: {language}, Framework: {framework}, Project Type: {project_type}"
                await self.send_progress(2, "Refinement started")

            max_attempts = 3
            
            for attempt in range(max_attempts):
                self.memory.iteration_count = attempt + 1
                # 2. Developer phase
                await self.send_progress(3, f"Developer coding (Attempt {self.memory.iteration_count})")
                await self.log("System", f"Developer is generating code for {stack_info}...", "system")
                
                dev_prompt = f"Stack: {stack_info}\nBlueprint: {self.memory.architecture_plan}\n\n"
                
                if is_refinement:
                    dev_prompt += f"CURRENT CODE:\n{self.memory.generated_code}\n\nUSER REFINEMENT REQUEST:\n{prompt}\n\nPlease update the existing code according to the request. Return the COMPLETE updated code."
                elif attempt > 0:
                    dev_prompt += f"Previous Code Attempt:\n{self.memory.generated_code}\n\nFIXES REQUIRED FROM PREVIOUS REVIEW:\n{self.memory.review_feedback}\n\nPlease provide the COMPLETE corrected code."
                else:
                    dev_prompt += "Implement the code now."
                    
                self.memory.generated_code = await developer.generate_response(dev_prompt)
                # Only log a summary in chat, the full code goes to the panel
                await self.log("Developer", f"Generated implementation ({len(self.memory.generated_code)} characters).", "chat")
                if self.websocket:
                    await self.websocket.send_text(json.dumps({
                        "type": "code",
                        "agent": "Developer",
                        "content": self.memory.generated_code
                    }))

                # 3. Quality Control (Manual check)
                quality_issues = self._check_code_quality(self.memory.generated_code)
                
                # 4. Reviewer phase
                await self.send_progress(4, "Reviewer checking")
                await self.log("System", "Reviewer is validating code correctness...", "system")
                review_prompt = f"Stack: {stack_info}\nArchitect's Plan: {self.memory.architecture_plan}\n\nDeveloper's Code:\n{self.memory.generated_code}"
                if is_refinement:
                    review_prompt += f"\n\nUser Refinement Request: {prompt}"
                if quality_issues:
                    review_prompt += f"\n\nNOTE: Automatic checks found these forbidden patterns:\n{quality_issues}"
                
                self.memory.review_feedback = await reviewer.generate_response(review_prompt)
                await self.log("Reviewer", self.memory.review_feedback)

                if self.memory.review_feedback.strip().upper().startswith("PASS") and not quality_issues:
                    await self.send_progress(5, "Final code ready")
                    await self.log("System", "Task completed successfully!", "system")
                    self.memory.final_result = self.memory.generated_code
                    
                    # Generate suggestions after success
                    asyncio.create_task(self.generate_suggestions())
                    
                    return self.memory.final_result
                
                if quality_issues and self.memory.review_feedback.strip().upper().startswith("PASS"):
                    # Force rejection if placeholders found even if Reviewer passed
                    self.memory.review_feedback = f"FIX_REQUIRED: Code contains forbidden placeholders:\n{quality_issues}"
                    await self.log("System", "Automatic check failed. Overriding PASS with FIX_REQUIRED.", "system")

                await self.log("System", f"Attempt {self.memory.iteration_count} failed validation. Requesting fix...", "system")

            await self.send_progress(5, "Final code ready")
            await self.log("System", "Reached maximum attempts. Returning latest version.", "system")
            self.memory.final_result = self.memory.generated_code
            
            # Generate suggestions even if max attempts reached
            asyncio.create_task(self.generate_suggestions())
            
            return self.memory.final_result
        except asyncio.CancelledError:
            print("Orchestrator task cancelled")
            raise
        except Exception as e:
            await self.log("System", f"Error during execution: {str(e)}", "system")
            raise

    async def generate_suggestions(self):
        """Generate 3-5 actionable improvement suggestions for the code."""
        try:
            architect = AgentRegistry.get_agent("Architect")
            if not architect:
                return

            suggestion_prompt = (
                f"Based on the following code and stack, suggest 3 to 5 actionable improvements or next steps. "
                f"Keep each suggestion under 10 words. "
                f"Return ONLY a JSON list of strings.\n\n"
                f"Stack: {self.memory.language} + {self.memory.framework}\n"
                f"Code: {self.memory.generated_code[:2000]}..."
            )
            
            response = await architect.generate_response(suggestion_prompt)
            # Try to parse JSON from response
            try:
                # Extract JSON if wrapped in markdown
                clean_response = response.strip()
                if "```json" in clean_response:
                    clean_response = clean_response.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_response:
                    clean_response = clean_response.split("```")[1].split("```")[0].strip()
                
                suggestions = json.loads(clean_response)
                if isinstance(suggestions, list) and self.websocket:
                    await self.websocket.send_text(json.dumps({
                        "type": "suggestions",
                        "content": suggestions
                    }))
            except:
                # Fallback to line-based parsing if JSON fails
                suggestions = [line.strip("- ").strip() for line in response.split("\n") if line.strip() and len(line) < 100][:5]
                if suggestions and self.websocket:
                    await self.websocket.send_text(json.dumps({
                        "type": "suggestions",
                        "content": suggestions
                    }))
        except Exception as e:
            print(f"Error generating suggestions: {e}")

    async def send_progress(self, step: int, label: str):
        if self.websocket:
            await self.websocket.send_text(json.dumps({
                "type": "progress",
                "step": step,
                "label": label
            }))
