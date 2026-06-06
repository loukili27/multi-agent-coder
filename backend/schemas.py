from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class Memory(BaseModel):
    user_prompt: str = ""
    language: str = ""
    framework: str = ""
    project_type: str = ""
    architecture_plan: Optional[str] = None
    generated_code: Optional[str] = None
    test_feedback: Optional[str] = None
    review_feedback: Optional[str] = None
    security_feedback: Optional[str] = None
    refinement_history: List[str] = Field(default_factory=list)
    iteration_count: int = 0
    final_result: Optional[str] = None
    history: List[Dict[str, Any]] = Field(default_factory=list)

    def add_log(self, agent: str, content: str, type: str = "chat"):
        self.history.append({
            "agent": agent,
            "content": content,
            "type": type
        })

    def reset_for_new_task(self, prompt: str, language: str, framework: str = "None", project_type: str = "Script"):
        self.user_prompt = prompt
        self.language = language
        self.framework = framework
        self.project_type = project_type
        self.architecture_plan = None
        self.generated_code = None
        self.test_feedback = None
        self.review_feedback = None
        self.security_feedback = None
        self.refinement_history = []
        self.iteration_count = 0
        self.final_result = None
        self.history = []
