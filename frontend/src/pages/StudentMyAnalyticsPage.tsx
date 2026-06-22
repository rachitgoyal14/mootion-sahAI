import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Gamepad2, 
  BarChart2, 
  Award,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Smile
} from 'lucide-react';
import { NavItem } from '../components/NavItem';

interface AttemptData {
  topic_name: string;
  chapter_name: string;
  activity_type: string;
  score: number;
  date: string;
  gaps: string[];
}

interface RecurringMisconception {
  misconception: string;
  count: number;
}

interface AnalyticsData {
  summary: {
    total_activities: number;
    recent_topic_name: string | null;
  };
  recent_attempts: AttemptData[];
  recurring_misconceptions: RecurringMisconception[];
}

export function StudentMyAnalyticsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/students/me/analytics');
        setData(res);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="flex flex-1 w-full bg-[#f6f4ee] font-montserrat text-[#1800ad] relative min-h-[100dvh] pb-24 md:pb-12">
      
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-[#1800ad] px-6 py-2.5 flex justify-between items-center z-40 rounded-full border-[2px] border-[#f6f4ee] shadow-xl font-montserrat">
        <NavItem icon={<LayoutDashboard size={24} />} onClick={() => navigate('/student/home')} />
        <NavItem icon={<CheckSquare size={24} />} onClick={() => navigate('/student/tasks')} />
        <NavItem icon={<Gamepad2 size={24} />} onClick={() => navigate('/student/playground')} />
        <NavItem icon={<BarChart2 size={24} />} active onClick={() => navigate('/student/analytics')} />
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col gap-6 sm:gap-8">
        
        {/* Header */}
        <header className="flex items-center justify-between mt-4 md:mt-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1800ad] flex items-center gap-2">
              <Sparkles className="text-amber-500" size={28} />
              My Progress
            </h1>
            <p className="text-[#1800ad]/70 font-semibold text-sm sm:text-base mt-1">
              See how much you've grown!
            </p>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-[#1800ad] border-r-transparent border-b-transparent border-l-transparent animate-spin duration-1000 mb-4"></div>
            <h2 className="text-lg font-black text-[#1800ad]">Loading your progress...</h2>
          </div>
        ) : !data || data.summary.total_activities === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center bg-white rounded-[32px] p-8 border-2 border-[#1800ad]/10 shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <Smile className="text-emerald-500" size={40} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1800ad] mb-2">Nothing here yet!</h2>
            <p className="text-[#1800ad]/70 font-semibold mb-6 max-w-sm mx-auto">
              Complete an activity like Explain It or Predict It to see your progress and get helpful tips.
            </p>
            <button
              onClick={() => navigate('/student/tasks')}
              className="px-6 py-3 bg-[#1800ad] text-white font-black rounded-full hover:scale-105 transition-all shadow-md text-sm flex items-center gap-2 mx-auto"
            >
              Start an Activity <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            
            {/* Quick Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 border-2 border-[#1800ad]/10 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Award className="text-indigo-600" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1800ad]/60 uppercase tracking-wider">Activities Done</p>
                  <p className="text-2xl font-black text-[#1800ad]">{data.summary.total_activities}</p>
                </div>
              </div>
              {data.summary.recent_topic_name && (
                <div className="bg-white rounded-3xl p-5 border-2 border-[#1800ad]/10 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                    <CheckSquare className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1800ad]/60 uppercase tracking-wider">Recently Practiced</p>
                    <p className="text-sm font-bold text-[#1800ad] line-clamp-1">{data.summary.recent_topic_name}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Things to Revisit (Recurring Misconceptions) */}
            {data.recurring_misconceptions && data.recurring_misconceptions.length > 0 && (
              <section className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Lightbulb className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-amber-900">Things to revisit</h2>
                    <p className="text-amber-700/80 text-xs font-semibold">Concepts you've stumbled on a few times. Keep practicing!</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {data.recurring_misconceptions.map((m, idx) => (
                    <div key={idx} className="bg-white/80 rounded-2xl p-4 border border-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-bold text-amber-900 leading-snug">{m.misconception}</span>
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-100/50 px-2.5 py-1 rounded-lg w-fit">
                        Spotted {m.count} times
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Attempts */}
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-black text-[#1800ad] ml-2">Recent Activities</h2>
              <div className="flex flex-col gap-3">
                {data.recent_attempts.map((attempt, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-5 border-2 border-[#1800ad]/5 shadow-sm hover:border-[#1800ad]/15 transition-all">
                    <div className="flex justify-between items-start mb-3 gap-4">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-[#1800ad]/5 text-[#1800ad] rounded-md text-[10px] font-bold uppercase tracking-wider mb-2">
                          {attempt.activity_type}
                        </span>
                        <h3 className="font-black text-[#1800ad] text-base leading-snug">{attempt.topic_name}</h3>
                        <p className="text-xs font-semibold text-[#1800ad]/60 mt-0.5">{attempt.chapter_name}</p>
                      </div>
                      <div className="shrink-0 bg-emerald-50 rounded-xl px-3 py-1.5 flex flex-col items-center justify-center border border-emerald-100">
                        <span className="text-lg font-black text-emerald-600">{attempt.score}/10</span>
                      </div>
                    </div>
                    
                    {attempt.gaps && attempt.gaps.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#1800ad]/5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1800ad]/50 mb-2">Helpful Tip for next time:</p>
                        <ul className="flex flex-col gap-1.5">
                          {attempt.gaps.map((gap, gIdx) => (
                            <li key={gIdx} className="text-sm font-semibold text-[#1800ad]/80 flex gap-2">
                              <span className="text-[#1800ad]/30">•</span> {gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
