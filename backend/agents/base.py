import os
from typing import Optional

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv(override=True)


class BaseAgent:
    def __init__(
        self,
        name: str,
        system_instruction: str,
        model: Optional[str] = None,
    ):
        self.name = name
        self.system_instruction = system_instruction

        self.model = model or os.getenv("OLLAMA_MODEL", "qwen2.5-coder:1.5b")

        self.client = AsyncOpenAI(
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"),
            api_key=os.getenv("OLLAMA_API_KEY", "ollama"),
        )

    async def generate_response(self, prompt: str) -> str:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": self.system_instruction,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.3,
        )

        return response.choices[0].message.content or ""