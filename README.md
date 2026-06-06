# Multi-Agent Coder
### AI Software Engineering Workspace

Multi-Agent Coder is a professional-grade AI software engineering platform that orchestrates a team of specialized agents to design, implement, and refine high-quality code. By leveraging a collaborative agent ecosystem, it transforms complex natural language requirements into complete, production-ready solutions.

## 🚀 The Vision
The future of software development isn't just about single-prompt generation; it's about **intelligent orchestration**. Multi-Agent Coder mimics a professional SDLC, where an Architect, a Developer, and a Reviewer collaborate in real-time, ensuring that every line of code is planned, implemented, and verified against technical constraints.

## ✨ Key Features
- **Architect-Led Design**: Every task begins with a structural blueprint, ensuring scalability and adherence to the selected stack.
- **Iterative Refinement**: Progressively improve, bug-fix, or extend existing code through a multi-turn conversational workflow.
- **Provider Agility**: Full support for both **Ollama** (private, local) and **OpenRouter** (cloud, high-performance) LLM backends.
- **Collaborative Agents**: Specialized roles (Architect, Developer, Reviewer) with distinct system instructions and quality gates.
- **Real-Time Streaming**: WebSocket-based architecture for instant streaming of agent thoughts, logs, and implementation progress.
- **Proactive Suggestions**: Intelligent "next-step" recommendations generated after every successful implementation.
- **Execution Control**: Instant Stop/Cancel support to interrupt long-running generations.
- **Flexible Stack Selection**: Built-in selectors for Languages, Frameworks, and Project Types to guide the generation process.

## 🖼️ Screenshots
Screenshots will be added after the first public release.
## 🏗️ Architecture Overview
Multi-Agent Coder is built on a modern, decoupled architecture:
- **Backend**: FastAPI (Python) with a custom Orchestration layer and Pydantic-based Shared Memory.
- **Frontend**: React + TypeScript + Vite, featuring a glassmorphism UI and real-time log/code viewers.
- **LLM Layer**: A provider abstraction layer that interfaces with OpenAI-compatible APIs (local or cloud).

## 🛠️ Getting Started

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **AI Provider**:
  - **Ollama** (for local development)
  - **OpenRouter API Key** (for cloud-based models)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/multi-agent-coder.git
   cd multi-agent-coder
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r ../requirements.txt
   python main.py
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## ⚙️ Configuration

Copy `.env.example` to `.env` in the root directory:

### Option A: OpenRouter (Recommended for Quality)
```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
MODEL=openrouter/auto
```

### Option B: Ollama (Recommended for Privacy)
```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=qwen2.5-coder:1.5b
```

## 🤖 AI Providers

### OpenRouter (Recommended for Quality)
**OpenRouter** is the recommended provider for professional use. It provides access to state-of-the-art models (like Claude 3.5 Sonnet or GPT-4o) that excel at the complex reasoning required for multi-agent orchestration.

### Ollama (Recommended for Privacy)
**Ollama** is ideal for local development and private projects. It ensures that your code never leaves your machine. For best results with the multi-agent workflow, we recommend models like `qwen2.5-coder:7b` or larger.

## 🔄 Real-World Workflow Example

1. **User**: "Create a FastAPI login endpoint."
2. **Architect**: Designs a blueprint including Pydantic models and security considerations.
3. **Developer**: Generates the complete FastAPI implementation with an `/auth/login` route.
4. **Reviewer**: Validates the code, checking for missing imports or logical errors.
5. **System**: Displays the code and provides **Suggested Improvements**:
    - *Add JWT authentication*
    - *Add unit tests*
    - *Improve password validation*
6. **User**: Selects "Add JWT authentication."
7. **System**: Instead of starting over, the **Refinement Lifecycle** takes the existing code and injects JWT logic seamlessly, maintaining all previous functionality.

## 🌐 Deployment Architecture

For a production-grade deployment, we recommend the following stack:
- **Frontend**: [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)
- **Backend**: [Render](https://render.com/) or [Railway](https://railway.app/)
- **AI Backend**: [OpenRouter](https://openrouter.ai/) (for high-availability and performance)

## 🗺️ Roadmap
- [ ] **Multi-File Generation**: Enabling the orchestrator to manage complex project structures.
- [ ] **Security Agent**: A dedicated agent for vulnerability scanning and secret detection.
- [ ] **Tester Agent**: Automated unit and integration test generation.
- [ ] **GitHub Integration**: Direct PR creation and code pushing from the workspace.
- [ ] **Deployment Templates**: One-click deployment for generated applications.
- [ ] **Multi-Model Routing**: Assign specific models to specific agent roles (e.g., Architect vs Developer).
- [ ] **CI/CD Support**: Built-in pipelines for continuous integration.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---
*Built with ❤️ for the next generation of software engineers.*
