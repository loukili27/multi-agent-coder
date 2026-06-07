import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Cpu, Layout, Code2, CheckCircle2, Trash2, Globe, Sparkles, MessageSquare } from 'lucide-react';
import LogViewer from './components/LogViewer';
import CodeDisplay from './components/CodeDisplay';
import ProgressBar from './components/ProgressBar';
import StackSelector from './components/StackSelector';
import SuggestionsPanel from './components/SuggestionsPanel';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000/ws/orchestrator';

interface LogEntry {
  agent: string;
  content: string;
  type: string;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [refinementFeedback, setRefinementFeedback] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [language, setLanguage] = useState('TypeScript');
  const [framework, setFramework] = useState('None');
  const [projectType, setProjectType] = useState('Script');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.style.height = 'auto';
      promptRef.current.style.height = `${Math.min(promptRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const connect = useCallback(function connect() {
    console.log("Connecting to WebSocket...");
  

  const socket = new WebSocket(WS_URL);
    ws.current = socket;
    
    socket.onopen = () => {
      console.log("WebSocket Connected successfully");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'progress') {
          setProgressStep(data.step);
          setProgressLabel(data.label);
          return;
        }

        if (data.type === 'code') {
          setCurrentCode(data.content);
          return;
        }

        if (data.type === 'suggestions') {
          setSuggestions(data.content);
          return;
        }
        
        setLogs((prev) => [...prev, data]);
        
        const content = data.content || "";
        const agent = data.agent || "";
        
        if ((agent === 'System' || data.type === 'log') && 
            (content.includes("Task completed successfully!") || 
             content.includes("Reached maximum attempts") ||
             content.includes("Process cancelled by user"))) {
          setIsProcessing(false);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setIsConnected(false);
    };

    socket.onclose = (event) => {
      console.log("WebSocket Closed:", event.code, event.reason);
      setIsConnected(false);
      setIsProcessing(false);
      setTimeout(connect, 3000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [connect]);

  const handleCancel = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: 'cancel' }));
    }
    setIsProcessing(false);
    setProgressStep(0);
    setProgressLabel('Cancelled');
  };

  const handleSubmit = (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isProcessing || !isConnected) return;

    const currentPrompt = prompt;
    setPrompt('');
    setLogs((prev) => [...prev, { agent: 'User', content: currentPrompt, type: 'chat' }]);
    setCurrentCode('');
    setIsProcessing(true);
    setProgressStep(1);
    setProgressLabel('Task received');
    
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ 
          prompt: currentPrompt,
          language: language,
          framework: framework,
          project_type: projectType
        }));
      } else {
        throw new Error("WebSocket is not open");
      }
    } catch (err) {
      console.error("Failed to send prompt:", err);
      setLogs(prev => [...prev, { agent: 'System', content: 'Error: Failed to send request to backend.', type: 'system' }]);
      setIsProcessing(false);
      setProgressStep(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleRefine = (feedbackOverride?: string) => {
    const feedback = feedbackOverride || refinementFeedback;
    if (!feedback.trim() || isProcessing || !isConnected) return;

    setRefinementFeedback('');
    setSuggestions([]);
    setLogs((prev) => [...prev, { agent: 'User', content: `Refinement: ${feedback}`, type: 'chat' }]);
    setIsProcessing(true);
    setProgressStep(2);
    setProgressLabel('Refinement started');
    
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ 
          type: 'refine',
          feedback: feedback,
          language: language,
          framework: framework,
          project_type: projectType
        }));
      }
    } catch (err) {
      console.error("Failed to send refinement:", err);
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setLogs([]);
    setCurrentCode('');
    setSuggestions([]);
    setProgressStep(0);
    setProgressLabel('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 backdrop-blur-md z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Multi-Agent Coder</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">v1.0 Local Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full border tracking-wide transition-all ${
            isConnected ? 'text-green-400 bg-green-400/5 border-green-400/20' : 'text-red-400 bg-red-400/5 border-red-400/20'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            {isConnected ? 'LIVE' : 'DISCONNECTED'}
          </div>
          
          <button 
            onClick={handleClear}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            title="Clear Workspace"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: Interaction */}
        <div className="lg:col-span-5 flex flex-col border-r border-slate-800/50 bg-slate-900/20">
          <div className="flex-1 overflow-hidden p-6 flex flex-col">
            <LogViewer logs={logs} />
          </div>
          
          <div className="p-6 bg-slate-900/40 border-t border-slate-800 backdrop-blur-sm">
            {isProcessing && (
              <ProgressBar step={progressStep} label={progressLabel} />
            )}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <StackSelector 
                language={language}
                framework={framework}
                projectType={projectType}
                onLanguageChange={setLanguage}
                onFrameworkChange={setFramework}
                onProjectTypeChange={setProjectType}
                disabled={isProcessing || !isConnected}
              />
              
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 relative w-full">
                  <textarea
                    ref={promptRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isConnected ? "What would you like to build?" : "Offline..."}
                    disabled={isProcessing || !isConnected}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 text-sm resize-none min-h-[52px] block"
                  />
                  <div className="absolute right-2 bottom-2 flex gap-2">
                    {isProcessing && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="p-1.5 bg-red-600 hover:bg-red-500 rounded-lg transition-all shadow-lg shadow-red-900/20"
                        title="Stop Generation"
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
                        </div>
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isProcessing || !prompt.trim() || !isConnected}
                      className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-blue-900/20"
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Code Output */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950">
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/50">
            <h2 className="flex items-center gap-2.5 font-bold text-sm tracking-tight">
              <Code2 className="w-4 h-4 text-blue-400" />
              Generated Code
              {isProcessing && (
                <span className="ml-2 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 animate-pulse uppercase tracking-widest">
                  Processing...
                </span>
              )}
            </h2>
            {currentCode && !isProcessing && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                  <Globe className="w-3.5 h-3.5" />
                  {language}
                </div>
                <span className="text-[11px] font-bold text-green-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Ready
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-auto p-6 bg-slate-950">
            {currentCode ? (
              <div className="flex flex-col gap-8">
                <CodeDisplay code={currentCode} />
                
                {/* Refinement Section */}
                {!isProcessing && (
                  <div className="mt-4 p-6 bg-slate-900/40 rounded-2xl border border-slate-800/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-blue-600/10 rounded-md border border-blue-600/20">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Improve Existing Code</h3>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <textarea
                        value={refinementFeedback}
                        onChange={(e) => setRefinementFeedback(e.target.value)}
                        placeholder="Describe what you want to change or add..."
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none h-24"
                      />
                      <button
                        onClick={() => handleRefine()}
                        disabled={!refinementFeedback.trim() || !isConnected}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:grayscale text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
                      >
                        <Sparkles className="w-4 h-4" />
                        Improve Code
                      </button>
                    </div>

                    <SuggestionsPanel 
                      suggestions={suggestions} 
                      onSelect={(s) => handleRefine(s)} 
                      disabled={isProcessing}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-6 opacity-30">
                <div className="relative">
                  <Layout className="w-20 h-20" />
                  <div className="absolute -bottom-2 -right-2 bg-slate-950 p-1">
                    <Code2 className="w-8 h-8 text-blue-500/50" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-1">Workspace Empty</p>
                  <p className="text-sm">Generated code will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
