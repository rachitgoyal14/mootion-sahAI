import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Flame, Award, Globe, Shield, Bell, 
  ChevronRight, Volume2, BookOpen, Activity 
} from 'lucide-react';
import { api } from '../../api';
import { User, Language } from '../../types';

interface StudentProfileProps {
  user: User;
  onLogout: () => void;
  onLanguageChange: (lang: Language) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ user, onLogout, onLanguageChange }) => {
  const navigate = useNavigate();

  const milestones = [
    { id: 'm1', label: 'First Explain It Completed', desc: 'Successfully explained current flow to Mootion AI', icon: Award, date: 'June 10, 2026' },
    { id: 'm2', label: '5-Day Streak Landmark', desc: 'Practiced concepts five consecutive days in a row', icon: Flame, date: 'June 12, 2026' },
    { id: 'm3', label: 'Conceptual Mastery Badge', desc: 'Achieved full 3.0 scores across all dimensions in Electric Circuits', icon: Award, date: 'June 14, 2026' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#07070c] relative z-10 p-6 md:p-8">
      <div className="grid-overlay" />
      <div className="ambient-light" />

      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 border-b border-slate-900 pb-4">
        <button
          onClick={() => navigate('/student/home')}
          className="text-slate-400 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center font-bold">
              {user.full_name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100 font-heading">{user.full_name}</h1>
              <p className="text-slate-500 text-xs mt-0.5">Class 8 Student</p>
            </div>
          </div>

          <div className="streak-badge">
            <Flame size={16} fill="white" />
            <span>7 days in a row</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start max-w-5xl w-full mx-auto pb-24">
        
        {/* Left progress column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Subject progress section */}
          <div className="glass-panel p-5 flex flex-col gap-4">
            <h3 className="font-bold text-slate-200 text-sm font-heading flex items-center gap-1.5">
              <BookOpen size={16} className="text-violet-400" />
              Academic Progress Card
            </h3>

            <div className="flex flex-col gap-4 mt-2">
              {[
                { title: 'Chapter 1: Electric Current', u: 3, r: 2, e: 3 },
                { title: 'Chapter 2: Ohm\'s Law and Resistance', u: 2, r: 3, e: 2 },
                { title: 'Chapter 3: Electric Circuits', u: 3, r: 2, e: 2 },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-350">{item.title}</h4>
                  
                  <div className="grid grid-cols-3 gap-3 text-[10px] font-bold text-slate-500 text-center uppercase tracking-wider">
                    <div className="flex flex-col bg-slate-900/40 p-2 border border-slate-850 rounded-lg">
                      <span>Understanding</span>
                      <span className="text-violet-400 mt-1 font-mono text-xs">{item.u}/3</span>
                    </div>
                    <div className="flex flex-col bg-slate-900/40 p-2 border border-slate-850 rounded-lg">
                      <span>Reasoning</span>
                      <span className="text-cyan-400 mt-1 font-mono text-xs">{item.r}/3</span>
                    </div>
                    <div className="flex flex-col bg-slate-900/40 p-2 border border-slate-850 rounded-lg">
                      <span>Expression</span>
                      <span className="text-emerald-400 mt-1 font-mono text-xs">{item.e}/3</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones timeline */}
          <div className="glass-panel p-5 flex flex-col gap-4">
            <h3 className="font-bold text-slate-200 text-sm font-heading flex items-center gap-1.5">
              <Award size={16} className="text-cyan-400" />
              Achievements & Milestones
            </h3>

            <div className="flex flex-col gap-3 mt-2">
              {milestones.map(m => {
                const Icon = m.icon;
                return (
                  <div key={m.id} className="flex gap-4 p-4 rounded-xl border border-slate-900 bg-slate-950/20 items-start">
                    <div className="p-2 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-lg flex-shrink-0 mt-0.5">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-200">{m.label}</h4>
                        <span className="text-[10px] text-slate-500 font-bold">{m.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right settings column */}
        <div className="flex flex-col gap-6">
          
          {/* Language progression ratio & nudge */}
          <div className="glass-panel p-5 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />

            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              Language Progression
            </h3>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Language Ratio (Voice session)</span>
              <div className="h-5 rounded-lg overflow-hidden flex text-[10px] font-bold text-center border border-slate-850">
                <div className="bg-violet-600 text-white flex items-center justify-center" style={{ width: '60%' }}>
                  HI 60%
                </div>
                <div className="bg-cyan-600 text-white flex items-center justify-center" style={{ width: '40%' }}>
                  EN 40%
                </div>
              </div>
            </div>

            {/* Language Prompt Nudge */}
            <div className="p-3.5 bg-rose-500/5 border border-rose-500/15 text-rose-350 rounded-xl text-xs flex flex-col gap-2 leading-relaxed">
              <span className="font-bold flex items-center gap-1">
                <Volume2 size={14} className="text-rose-400" /> Speech Recommendation
              </span>
              <p className="font-semibold text-slate-300">
                "You explained the mechanism really well in Hindi. Want to try saying it in English next time to test your vocabulary?"
              </p>
            </div>
          </div>

          {/* Quick Settings Panel */}
          <div className="glass-panel p-5 flex flex-col gap-5">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              Interface Settings
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Language Preferred</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {['english', 'hindi', 'gujarati'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      onLanguageChange(lang as Language);
                      api.setStudentLanguage(lang);
                    }}
                    className={`py-2 rounded-md text-xs font-bold uppercase transition-all ${
                      user.preferred_language === lang 
                        ? 'bg-violet-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4 flex flex-col gap-2">
              <button
                onClick={onLogout}
                className="w-full btn-secondary py-2 text-xs font-bold"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
