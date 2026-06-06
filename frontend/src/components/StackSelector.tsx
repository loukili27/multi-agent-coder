import React from 'react';
import { ChevronDown } from 'lucide-react';

interface StackSelectorProps {
  language: string;
  framework: string;
  projectType: string;
  onLanguageChange: (value: string) => void;
  onFrameworkChange: (value: string) => void;
  onProjectTypeChange: (value: string) => void;
  disabled?: boolean;
}

const languages = ["Python", "TypeScript", "JavaScript", "Java", "C++", "Rust", "Go", "R", "MATLAB", "SQL"];
const frameworks = ["None", "FastAPI", "Flask", "React", "Next.js", "Vue", "Express", "NestJS", "Spring Boot", "PostgreSQL", "MySQL", "SQLite"];
const projectTypes = ["API", "Web App", "CLI Tool", "Script", "Data Science", "Machine Learning", "Deep Learning", "Database Schema", "SQL Query", "Desktop App"];

const Selector: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ label, value, options, onChange, disabled }) => (
  <div className="flex-1 min-w-[140px]">
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none bg-slate-800/50 border border-slate-700/50 text-slate-200 text-xs rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50 cursor-pointer backdrop-blur-sm"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
    </div>
  </div>
);

const StackSelector: React.FC<StackSelectorProps> = ({
  language,
  framework,
  projectType,
  onLanguageChange,
  onFrameworkChange,
  onProjectTypeChange,
  disabled
}) => {
  return (
    <div className="flex flex-wrap gap-3 w-full mb-4 bg-slate-900/20 p-3 rounded-xl border border-slate-800/50">
      <Selector label="Language" value={language} options={languages} onChange={onLanguageChange} disabled={disabled} />
      <Selector label="Framework" value={framework} options={frameworks} onChange={onFrameworkChange} disabled={disabled} />
      <Selector label="Project Type" value={projectType} options={projectTypes} onChange={onProjectTypeChange} disabled={disabled} />
    </div>
  );
};

export default StackSelector;
