import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Mic, Compass, Sparkles, Check } from 'lucide-react';
import { api } from '../../api';
import { Language } from '../../types';

interface StudentOnboardingProps {
  onOnboardingComplete: (user: any) => void;
}

export const StudentOnboarding: React.FC<StudentOnboardingProps> = ({ onOnboardingComplete }) => {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(1);
  const [language, setLanguage] = useState<Language>('english');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Set student language and mark onboarding complete in backend
      await api.setStudentLanguage(language);

      // Fetch updated profile
      const user = await api.getCurrentUser();
      onOnboardingComplete(user);

      // Redirect to student home screen
      navigate('/student/home');
    } catch (e) {
      console.error(e);
      navigate('/student/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#07070c] relative z-10">
      <div className="grid-overlay" />
      <div className="ambient-light" />
      <div className="ambient-light-bottom" />

      <div className="w-full max-w-md glass-panel p-8 flex flex-col relative overflow-hidden">
        {/* Subtle glowing ring background */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Slides indicator */}
        <div className="flex gap-1.5 justify-center mb-8">
          {[1, 2, 3].map(s => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-350 ${
                s === slide ? 'bg-violet-500 w-8' : 'bg-slate-800 w-3'
              }`}
            />
          ))}
        </div>

        {/* Slide 1: Welcome & Language selection */}
        {slide === 1 && (
          <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
            <div className="p-4 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-full animate-pulse">
              <Globe size={32} />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold text-slate-100 font-heading">Choose Language</h2>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Choose the language you feel most comfortable speaking in during AI voice sessions.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full mt-4">
              {(['english', 'hindi', 'gujarati'] as const).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`py-3 px-2 border rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ${
                    language === lang 
                      ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-md shadow-violet-600/10'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span>{lang === 'english' ? '🇬🇧' : lang === 'hindi' ? '🇮🇳' : '🇮🇳'}</span>
                  <span>{lang}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSlide(2)}
              className="btn-primary w-full mt-6"
            >
              Continue
            </button>
          </div>
        )}

        {/* Slide 2: Explaining to Mootion AI */}
        {slide === 2 && (
          <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
            <div className="p-4 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-full animate-bounce">
              <Mic size={32} />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold text-slate-100 font-heading">Explain to Teach</h2>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Mootion helps you learn by teaching. Speak into the microphone, explain physics concepts to the AI, and get real-time probe responses!
              </p>
            </div>

            <div className="flex justify-between w-full mt-6 gap-3">
              <button
                onClick={handleFinish}
                className="btn-secondary flex-1 text-xs"
              >
                Skip Intro
              </button>
              <button
                onClick={() => setSlide(3)}
                className="btn-primary flex-1 text-xs"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Slide 3: Explore and Playgrounds */}
        {slide === 3 && (
          <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
            <div className="p-4 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-full">
              <Compass size={32} />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold text-slate-100 font-heading">Explore Playgrounds</h2>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                No active homework tasks? Dive into the playground! Generate custom animations, play with sliders, and request answers dynamically.
              </p>
            </div>

            <button
              onClick={handleFinish}
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={16} />
                  <span>Start Learning</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
