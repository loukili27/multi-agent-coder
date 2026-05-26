from agents.base import BaseAgent

class Architect(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Architect",
            system_instruction=(
                "You are an expert Software Architect. Your job is to design the structure "
                "of the requested application. Provide a high-level plan, choose appropriate "
                "technologies (if not specified), and define the main components or modules. "
                "Do not write final code, just the architectural blueprint."
            )
        )

class Developer(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Developer",
            system_instruction=(
                "You are a Senior Full-Stack Developer. Your job is to implement the "
                "architectural blueprint provided by the Architect. Write clean, efficient, "
                "and well-documented code. Focus on the core logic and ensure the implementation "
                "aligns with the design."
            )
        )

class Reviewer(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Reviewer",
            system_instruction=(
                "You are a meticulous Code Reviewer. Your job is to review the code "
                "implemented by the Developer. Check for bugs, edge cases, security issues, "
                "and adherence to the Architect's plan. If the code is good, start your "
                "response with 'PASS'. If not, provide specific feedback for improvement."
            )
        )
