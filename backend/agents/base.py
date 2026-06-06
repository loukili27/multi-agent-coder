import os
from typing import Optional, List, Dict, Any
import logging

from dotenv import load_dotenv
from openai import AsyncOpenAI, APIError, AuthenticationError, RateLimitError, APIConnectionError
from agents.provider import get_llm_config

load_dotenv(override=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentRegistry:
    _agents = {}

    @classmethod
    def register(cls, name: str):
        def wrapper(agent_cls):
            cls._agents[name.lower()] = agent_cls
            return agent_cls
        return wrapper

    @classmethod
    def get_agent(cls, name: str) -> Optional['BaseAgent']:
        agent_cls = cls._agents.get(name.lower())
        if agent_cls:
            return agent_cls()
        return None

    @classmethod
    def list_agents(cls) -> List[str]:
        return list(cls._agents.keys())

class BaseAgent:
    def __init__(
        self,
        name: str,
        system_instruction: str,
        model: Optional[str] = None,
    ):
        self.name = name
        self.system_instruction = system_instruction
        
        try:
            self.client, default_model = get_llm_config()
            self.model = model or default_model
        except Exception as e:
            logger.error(f"Failed to initialize LLM config for agent {name}: {str(e)}")
            raise

    async def generate_response(self, prompt: str) -> str:
        try:
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
            
        except AuthenticationError:
            error_msg = "Authentication failed: Please check your API key."
            logger.error(f"[{self.name}] {error_msg}")
            return f"ERROR: {error_msg}"
        except RateLimitError:
            error_msg = "Rate limit exceeded: Too many requests. Please wait a moment."
            logger.error(f"[{self.name}] {error_msg}")
            return f"ERROR: {error_msg}"
        except APIConnectionError:
            error_msg = "Network error: Failed to connect to the AI provider."
            logger.error(f"[{self.name}] {error_msg}")
            return f"ERROR: {error_msg}"
        except APIError as e:
            error_msg = f"API error occurred: {str(e)}"
            logger.error(f"[{self.name}] {error_msg}")
            return f"ERROR: {error_msg}"
        except Exception as e:
            error_msg = f"An unexpected error occurred: {str(e)}"
            logger.error(f"[{self.name}] {error_msg}")
            return f"ERROR: {error_msg}"
