# Multi-Agent Coder: Technical Documentation

## 1. System Architecture
Multi-Agent Coder is a distributed system designed for collaborative AI code generation. It separates concerns across a modern web stack:
- **Frontend**: A React-based SPA that manages user interaction and WebSocket state.
- **Backend**: A FastAPI server that orchestrates agent collaboration and maintains session memory.
- **Provider Layer**: An abstraction module that allows seamless switching between different LLM backends.

## 2. Backend Architecture
The backend is the "brain" of the platform, built on three core pillars:

### Orchestrator Workflow
The `Orchestrator` class (`backend/orchestrator.py`) manages the lifecycle of a coding task:
1. **Architect Phase**: High-level design and requirement mapping.
2. **Developer Phase**: Implementation based on the Architect's blueprint.
3. **Reviewer Phase**: Quality control and validation.
4. **Correction Loop**: If the Reviewer fails the code, the Developer receives feedback and attempts a fix (up to 3 attempts).

### Shared Memory System
Session state is maintained using a Pydantic-based `Memory` model (`backend/schemas.py`). This allows:
- **Persistence**: Knowledge of the Architect's plan is preserved during Developer turns.
- **History**: The `refinement_history` tracks all user modifications, allowing for context-aware iterative improvements.
- **Context Injection**: Each agent receives the relevant parts of the memory (e.g., the Developer sees the Architect's plan).

### Agent Registry
Agents are dynamically registered using the `@AgentRegistry.register` decorator. This modular design makes it easy to add specialized agents (e.g., a "Security Specialist" or "Documentation Writer") without modifying the core orchestrator logic.

## 3. Frontend Architecture
The frontend is optimized for real-time feedback and iterative refinement:
- **WebSocket Hook**: Manages a persistent connection to the backend, handling auto-reconnection and state syncing.
- **Modular Components**:
    - `CodeDisplay`: Handles syntax highlighting and markdown parsing.
    - `LogViewer`: A unified stream for agent communication.
    - `StackSelector`: Captures technical requirements before generation starts.
    - `SuggestionsPanel`: Dynamically renders actionable next steps.

## 4. Communication Protocol

### WebSocket Message Types
The system uses JSON-encoded messages for bi-directional communication:

**Client to Server:**
- `{"prompt": "..."}`: Starts a new task.
- `{"type": "refine", "feedback": "..."}`: Triggers an iterative refinement cycle.
- `{"action": "cancel"}`: Terminates the current generation process.

**Server to Client:**
- `{"type": "log"}`: Status updates and agent thoughts.
- `{"type": "code"}`: The implementation content for the Code Viewer.
- `{"type": "progress"}`: Numeric step updates for the Progress Bar.
- `{"type": "suggestions"}`: A list of recommended improvements.

## 5. Provider Abstraction Layer
Located in `backend/agents/provider.py`, this layer decouples the agents from the underlying LLM:
- **Ollama Integration**: Interfaces with local models via an OpenAI-compatible `/v1` endpoint.
- **OpenRouter Integration**: Connects to cloud models with specific headers for usage tracking.
- **Error Handling**: Standardizes error responses (Rate limits, Authentication, Connection) across all providers.

## 6. Iterative Refinement Lifecycle
When a user submits a refinement:
1. The `Orchestrator` identifies the request as a refinement.
2. The current `generated_code` is pulled from memory.
3. The `Developer` agent receives both the current code and the new feedback.
4. The system regenerates the code and passes it back through the `Reviewer` phase.

## 7. Project Structure
```text
multi-agent-coder/
├── backend/
│   ├── agents/
│   │   ├── base.py          # Base agent logic
│   │   ├── provider.py      # LLM Provider Abstraction
│   │   └── specialized.py   # Specialized Agent implementations
│   ├── main.py              # FastAPI Entry Point
│   ├── orchestrator.py      # Core logic and handoffs
│   └── schemas.py           # Shared Memory & Data Models
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (LogViewer, CodeDisplay, etc.)
│   │   └── App.tsx          # Main Application state
└── .env.example             # Configuration template
```

## 8. Future Improvements
- **Multi-File Generation**: Enabling the orchestrator to manage complex project structures.
- **Security Agent**: A dedicated agent for vulnerability scanning and secret detection.
- **Tester Agent**: Automated unit and integration test generation.
- **GitHub Integration**: Direct PR creation and code pushing from the workspace.
- **Deployment Templates**: One-click deployment for generated applications.
- **Multi-Model Routing**: Assign specific models to specific agent roles (e.g., Architect vs Developer).
- **CI/CD Support**: Built-in pipelines for continuous integration.
