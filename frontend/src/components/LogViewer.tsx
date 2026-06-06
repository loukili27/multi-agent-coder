import React, { useEffect, useRef } from 'react';
import { User, Terminal, ShieldCheck, Code, Brain } from 'lucide-react';

interface LogEntry {
  agent: string;
  content: string;
  type: string;
}

interface LogViewerProps {
  logs: LogEntry[];
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getAgentConfig = (agent: string) => {
    switch (agent) {
      case 'Architect': 
        return { 
          icon: <Brain className="w-4 h-4" />, 
          color: 'text-purple-400', 
          bg: 'bg-purple-400/10',
          border: 'border-purple-400/20',
          label: 'Architect'
        };
      case 'Developer': 
        return { 
          icon: <Code className="w-4 h-4" />, 
          color: 'text-green-400', 
          bg: 'bg-green-400/10',
          border: 'border-green-400/20',
          label: 'Developer'
        };
      case 'Reviewer': 
        return { 
          icon: <ShieldCheck className="w-4 h-4" />, 
          color: 'text-blue-400', 
          bg: 'bg-blue-400/10',
          border: 'border-blue-400/20',
          label: 'Reviewer'
        };
      case 'System': 
        return { 
          icon: <Terminal className="w-4 h-4" />, 
          color: 'text-yellow-400', 
          bg: 'bg-yellow-400/10',
          border: 'border-yellow-400/20',
          label: 'System'
        };
      case 'User': 
        return { 
          icon: <User className="w-4 h-4" />, 
          color: 'text-slate-200', 
          bg: 'bg-slate-700',
          border: 'border-slate-600',
          label: 'You'
        };
      default: 
        return { 
          icon: <Terminal className="w-4 h-4" />, 
          color: 'text-slate-400', 
          bg: 'bg-slate-800',
          border: 'border-slate-700',
          label: agent 
        };
    }
  };

  return (
    <div 
      ref={scrollRef}
      className="flex-1 flex flex-col gap-4 overflow-y-auto p-4 bg-slate-900/50 rounded-xl border border-slate-800 scroll-smooth"
    >
      {logs.map((log, index) => {
        const config = getAgentConfig(log.agent);
        const isUser = log.agent === 'User';
        const isSystem = log.agent === 'System';

        return (
          <div key={index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex items-center gap-2 mb-1.5 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div className={`p-1 rounded-md ${config.bg} ${config.color} border ${config.border}`}>
                {config.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{config.label}</span>
            </div>
            
            <div className={`max-w-[92%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
              isSystem ? 'bg-slate-800/40 border border-slate-700/50 text-slate-400 italic' :
              isUser ? 'bg-blue-600 text-white shadow-blue-900/20' :
              `bg-slate-800 border border-slate-700 text-slate-200 ${config.border}`
            }`}>
              {log.type === 'code' ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Code className="w-4 h-4" />
                  <span>Generated new code for {log.agent}</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{log.content}</div>
              )}
            </div>
          </div>
        );
      })}
      
      {logs.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-3 opacity-40">
          <Brain className="w-12 h-12" />
          <p className="text-sm italic font-medium">Ready to assist. Select a stack and describe your task.</p>
        </div>
      )}
    </div>
  );
};

export default LogViewer;
