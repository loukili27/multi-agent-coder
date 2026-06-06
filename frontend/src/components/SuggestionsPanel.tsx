import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

interface SuggestionsPanelProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ suggestions, onSelect, disabled }) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-yellow-500/10 rounded-md border border-yellow-500/20">
          <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
        </div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          Suggested Improvements
          <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            disabled={disabled}
            className="px-4 py-2 bg-slate-900/50 hover:bg-blue-600/10 border border-slate-800 hover:border-blue-500/30 text-slate-300 hover:text-blue-400 text-xs font-medium rounded-full transition-all duration-300 disabled:opacity-50 disabled:grayscale flex items-center gap-2"
          >
            <span className="w-1 h-1 rounded-full bg-blue-500/50"></span>
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionsPanel;
