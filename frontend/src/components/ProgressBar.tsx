import React from 'react';

interface ProgressBarProps {
  step: number;
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ step, label }) => {
  const steps = [
    'Task received',
    'Architect planning',
    'Developer coding',
    'Reviewer checking',
    'Final code ready'
  ];

  const percentage = (step / steps.length) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-medium text-blue-400 animate-pulse">
          {label}...
        </span>
        <span className="text-xs text-slate-500">
          Step {step} of {steps.length}
        </span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="grid grid-cols-5 mt-2 gap-1">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-colors duration-300 ${
              i < step ? 'bg-blue-500/50' : 'bg-slate-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
