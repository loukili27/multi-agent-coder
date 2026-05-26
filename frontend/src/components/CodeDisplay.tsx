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
      <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 border-b border-slate-700 flex justify-between items-center">
        <span>{displayLanguage.toUpperCase()}</span>
        <button 
          onClick={() => navigator.clipboard.writeText(displayCode)}
          className="hover:text-white transition-colors"
        >
          Copy
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
