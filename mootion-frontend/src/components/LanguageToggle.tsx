import React from 'react';
import { Languages } from 'lucide-react';
import { Language } from '../types';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLanguage, onLanguageChange }) => {
  const languages: { code: Language; label: string }[] = [
    { code: 'english', label: 'EN' },
    { code: 'hindi', label: 'HI' },
    { code: 'gujarati', label: 'GJ' }
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-full p-1 backdrop-blur-md shadow-lg">
      <div className="p-1.5 text-slate-400">
        <Languages size={16} />
      </div>
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-all ${
            currentLanguage === lang.code
              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
