import React from 'react';
import { User, Bot, Terminal, ShieldCheck } from 'lucide-react';

interface LogEntry {
  agent: string;
  content: string;
  type: string;
}

interface LogViewerProps {
  logs: LogEntry[];
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const getIcon = (agent: string) => {
    switch (agent) {
      case 'Architect': return <ShieldCheck className="w-5 h-5 text-blue-400" />;
      case 'Developer': return <Terminal className="w-5 h-5 text-green-400" />;
      case 'Reviewer': return <Bot className="w-5 h-5 text-purple-400" />;
      case 'System': return <Terminal className="w-5 h-5 text-yellow-400" />;
      default: return <User className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] p-4 bg-slate-800/50 rounded-xl border border-slate-700">
      {logs.map((log, index) => (
        <div key={index} className={`flex flex-col ${log.agent === 'User' ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1 px-2">
            {getIcon(log.agent)}
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{log.agent}</span>
          </div>
          <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${
            log.agent === 'System' ? 'bg-slate-800 border border-slate-700 text-slate-400 italic' :
            log.agent === 'User' ? 'bg-blue-600 text-white' :
            'bg-slate-700 text-slate-200'
          }`}>
            {log.type === 'code' ? 'Generated new code (see panel)' : log.content}
          </div>
        </div>
      ))}
      {logs.length === 0 && (
        <div className="text-center py-20 text-slate-500 italic">
          No activity yet. Start a new project to see the agents in action.
        </div>
      )}
    </div>
  );
};

export default LogViewer;
