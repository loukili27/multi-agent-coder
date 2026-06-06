import os
from typing import Tuple, Optional
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv(override=True)

def get_llm_config() -> Tuple[AsyncOpenAI, str]:
    """
    Returns the appropriate AsyncOpenAI client and model name based on AI_PROVIDER.
    Supports 'ollama' and 'openrouter'.
    """
    provider = os.getenv("AI_PROVIDER", "ollama").lower()
    
    if provider == "openrouter":
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY is not set in environment variables.")
        
        model = os.getenv("MODEL", "openrouter/auto")
        client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            default_headers={
                "HTTP-Referer": "https://github.com/Multi-Agent-Coder", # Optional, for OpenRouter rankings
                "X-Title": "Multi-Agent Coder", # Optional, for OpenRouter rankings
            }
        )
        return client, model
    
    elif provider == "ollama":
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
        model = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:1.5b")
        api_key = os.getenv("OLLAMA_API_KEY", "ollama")
        
        client = AsyncOpenAI(
            base_url=base_url,
            api_key=api_key,
        )
        return client, model
    
    else:
        raise ValueError(f"Unsupported AI_PROVIDER: {provider}. Supported providers are 'ollama' and 'openrouter'.")
