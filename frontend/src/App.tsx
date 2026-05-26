import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Cpu, Layout, Code2, CheckCircle2 } from 'lucide-react';
import LogViewer from './components/LogViewer';
import CodeDisplay from './components/CodeDisplay';

interface LogEntry {
  agent: string;
  content: string;
  type: string;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(function connect() {
    console.log("Connecting to WebSocket...");
    const socket = new WebSocket('ws://127.0.0.1:8000/ws/orchestrator');
    ws.current = socket;
    
    socket.onopen = () => {
      console.log("WebSocket Connected successfully");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      console.log("Message received:", event.data);
      const data = JSON.parse(event.data);
      if (data.type === 'code') {
        setCurrentCode(data.content);
      }
      setLogs((prev) => [...prev, data]);
      if (data.agent === 'System' && (data.content.includes("Task completed successfully!") || data.content.includes("Reached maximum turns"))) {
        setIsProcessing(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isProcessing || !isConnected) return;

    const currentPrompt = prompt;
    setPrompt('');
    setLogs([{ agent: 'User', content: currentPrompt, type: 'chat' }]);
    setCurrentCode('');
    setIsProcessing(true);
    
    try {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ prompt: currentPrompt }));
      } else {
        throw new Error("WebSocket is not open");
      }
    } catch (err) {
      console.error("Failed to send prompt:", err);
      setLogs(prev => [...prev, { agent: 'System', content: 'Error: Failed to send request to backend.', type: 'system' }]);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Multi-Agent Coder</h1>
        </div>
        <div className="flex gap-4">
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
            isConnected ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            {isConnected ? 'Backend Connected' : 'Backend Disconnected'}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-160px)]">
        {/* Left Column: Chat & Interaction */}
        <div className="flex flex-col gap-6 h-full">
          <LogViewer logs={logs} />
          
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isConnected ? "Describe what you want to build..." : "Reconnecting to backend..."}
              disabled={isProcessing || !isConnected}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isProcessing || !prompt.trim() || !isConnected}
              className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>

        {/* Right Column: Code Output */}
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h2 className="flex items-center gap-2 font-semibold">
              <Code2 className="w-5 h-5 text-blue-400" />
              Final Output
            </h2>
            {currentCode && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ready to use
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto rounded-xl bg-slate-950 border border-slate-800">
            {currentCode ? (
              <CodeDisplay code={currentCode} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4">
                <Layout className="w-16 h-16 opacity-20" />
                <p>Code will appear here once agents start working...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
