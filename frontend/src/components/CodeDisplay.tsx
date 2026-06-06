import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeDisplayProps {
  code: string;
  language?: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
  // Regex to match markdown code blocks: ```language \n code \n ```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/;
  const match = code.match(codeBlockRegex);
  
  const displayCode = match ? match[2] : code;
  const displayLanguage = match ? (match[1] || 'javascript') : 'javascript';

  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      <div className="bg-slate-900 px-4 py-2.5 text-[11px] font-bold text-slate-500 border-b border-slate-800 flex justify-between items-center tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>{displayLanguage}</span>
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(displayCode);
            // Optional: Add a brief toast or state change for feedback
          }}
          className="hover:text-white transition-colors flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md border border-slate-700 hover:border-slate-500"
        >
          Copy Code
        </button>
      </div>
      <SyntaxHighlighter 
        language={displayLanguage} 
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1rem', fontSize: '0.875rem' }}
      >
        {displayCode}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeDisplay;
