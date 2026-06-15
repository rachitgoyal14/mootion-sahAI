import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BarChart3, ChevronRight, Users, BookOpen, AlertCircle, 
  CircleDot, HelpCircle, Activity, Mic, BrainCircuit, BookMarked
} from 'lucide-react';
import { api } from '../../api';
import { ClassInfo, ClassAnalytics, ChapterAnalytics, StudentAnalytics } from '../../types';

export const TeacherAnalytics: React.FC = () => {
  const navigate = useNavigate();

  // Navigation View State
  const [view, setView] = useState<'overview' | 'chapter' | 'student'>('overview');
  
  // Selected Contexts
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('c1');
  const [selectedChapterTitle, setSelectedChapterTitle] = useState<string>('Electric Current');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('s1');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('Rahul Kumar');

  // API Data
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics | null>(null);
  const [chapterAnalytics, setChapterAnalytics] = useState<ChapterAnalytics | null>(null);
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClasses() {
      try {
        const cls = await api.getTeacherClasses();
        setClasses(cls);
        if (cls.length > 0) {
          setSelectedClass(cls[0]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadClasses();
  }, []);

  useEffect(() => {
    async function fetchAnalytics() {
      const activeClass = selectedClass;
      if (!activeClass) return;

      setLoading(true);
      try {
        const classData = await api.getClassAnalytics(activeClass.class_id);
        setClassAnalytics(classData);

        const chapterData = await api.getChapterAnalytics(selectedChapterId, selectedChapterTitle);
        setChapterAnalytics(chapterData);

        const studentData = await api.getStudentAnalytics(selectedStudentId, selectedStudentName);
        setStudentAnalytics(studentData);
      } catch (e) {
        console.error("Failed to load analytics", e);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [selectedClass, selectedChapterId, selectedStudentId]);


  const handleClassChange = (classId: string) => {
    const found = classes.find(c => c.class_id === classId);
    if (found) {
      setSelectedClass(found);
    }
  };

  const getScoreColor = (val: number) => {
    if (val < 1) return 'bg-rose-500 text-white';
    if (val < 2) return 'bg-amber-500 text-white';
    if (val < 2.5) return 'bg-emerald-500 text-white';
    return 'bg-cyan-500 text-white';
  };

  if (loading || !selectedClass) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#07070c] relative z-10">
        <span className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-3 font-bold uppercase tracking-wider animate-pulse">Analyzing Class Records...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#07070c] relative z-10 p-6 md:p-8">
      <div className="grid-overlay" />
      <div className="ambient-light" />

      {/* Header and Class Dropdown */}
      <div className="flex flex-col gap-4 mb-8">
        <button
          onClick={() => navigate('/teacher/home')}
          className="text-slate-400 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-600/30">
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-100 font-heading">Performance Analytics</h1>
              <p className="text-slate-400 text-xs mt-0.5">Real-time learning stats derived from voice exercises</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-48">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Select Class</label>
            <select
              value={selectedClass.class_id}
              onChange={(e) => handleClassChange(e.target.value)}
              className="form-input bg-slate-950 font-semibold"
            >
              {classes.map(c => (
                <option key={c.class_id} value={c.class_id}>
                  Class {c.grade} — {c.subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: CLASS OVERVIEW */}
      {view === 'overview' && classAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in pb-16">
          
          {/* Main Heatmap and Metrics panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Heatmap Grid */}
            <div className="glass-panel p-5 flex flex-col gap-4">
              <h3 className="font-bold text-slate-200 text-sm font-heading flex items-center gap-2">
                <BrainCircuit size={16} className="text-violet-400" />
                Concept Understanding Summary
              </h3>
              
              {/* Desktop Heatmap Matrix */}
              <div className="hidden md:flex flex-col gap-4 mt-2">
                <div className="grid grid-cols-5 text-center text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  <span>Chapter</span>
                  <span>Understanding</span>
                  <span>Reasoning</span>
                  <span>Expression</span>
                  <span>Drill Detail</span>
                </div>

                {[
                  { id: 'c1', title: 'Electric Current', u: 3, r: 2, e: 3 },
                  { id: 'c2', title: 'Ohm\'s Law', u: 2, r: 3, e: 2 },
                  { id: 'c3', title: 'Electric Circuits', u: 1, r: 1, e: 2 },
                  { id: 'c4', title: 'Joule Heating', u: 0, r: 1, e: 1 },
                ].map(item => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setSelectedChapterId(item.id);
                      setSelectedChapterTitle(item.title);
                      setView('chapter');
                    }}
                    className="grid grid-cols-5 items-center text-center p-3 border border-slate-900 bg-slate-950/40 rounded-xl hover:border-slate-800 transition-colors cursor-pointer group"
                  >
                    <span className="font-bold text-slate-300 text-xs text-left truncate">{item.title}</span>
                    <div className="flex justify-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${getScoreColor(item.u)}`}>
                        {item.u}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${getScoreColor(item.r)}`}>
                        {item.r}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${getScoreColor(item.e)}`}>
                        {item.e}
                      </span>
                    </div>
                    <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform flex items-center justify-center gap-0.5">
                      Analyze <ChevronRight size={10} />
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile Pill-List Heatmap View */}
              <div className="flex flex-col gap-3 md:hidden mt-2">
                {[
                  { id: 'c1', title: 'Electric Current', score: 2.6 },
                  { id: 'c2', title: 'Ohm\'s Law', score: 2.3 },
                  { id: 'c3', title: 'Electric Circuits', score: 1.3 },
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedChapterId(item.id);
                      setSelectedChapterTitle(item.title);
                      setView('chapter');
                    }}
                    className="flex justify-between items-center p-3 rounded-lg border border-slate-800 bg-slate-950/40"
                  >
                    <span className="text-xs font-bold text-slate-300 truncate">{item.title}</span>
                    <span className={`status-pill ${getScoreColor(item.score)}`}>
                      Score: {item.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Misconception Alert Card */}
            <div className="glass-panel p-5 flex gap-4 border-l-4 border-l-rose-500 bg-rose-500/5">
              <div className="mt-0.5 p-1.5 bg-rose-600/10 border border-rose-500/20 text-rose-500 rounded-lg">
                <AlertCircle size={18} />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-rose-400">
                  <h3 className="font-bold text-xs uppercase tracking-wider">Top Misconception Alert</h3>
                  <span className="bg-rose-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                    {classAnalytics.misconception_count} Students Affected
                  </span>
                </div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  "{classAnalytics.most_common_misconception}"
                </p>
                <button 
                  onClick={() => {
                    setSelectedChapterId('c1');
                    setSelectedChapterTitle('Electric Current');
                    setView('chapter');
                  }}
                  className="text-xs text-rose-400 font-bold uppercase tracking-wider mt-1.5 self-start hover:underline"
                >
                  Inspect Misconception Breakdown &rarr;
                </button>
              </div>
            </div>

            {/* Chronological Recent activity feed */}
            <div className="glass-panel p-5 flex flex-col gap-4">
              <h3 className="font-bold text-slate-200 text-sm font-heading flex items-center gap-2">
                <Activity size={16} className="text-cyan-400" />
                Recent Submissions
              </h3>

              <div className="flex flex-col gap-3">
                {classAnalytics.recent_activities.map((act, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setSelectedStudentId(act.student_id);
                      setSelectedStudentName(act.student_name);
                      setView('student');
                    }}
                    className="flex justify-between items-center p-3 rounded-lg border border-slate-900 bg-slate-950/20 hover:border-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold font-heading">
                        {act.student_name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{act.student_name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {act.chapter_title} — {act.activity_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-bold">{act.date}</span>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${getScoreColor(act.score)}`}>
                        {act.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side analytics column */}
          <div className="flex flex-col gap-6">
            
            {/* Task Completion Ring Card */}
            <div className="glass-panel p-6 flex flex-col items-center gap-6 text-center">
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider self-start">
                Task Completion Ring
              </h3>

              <div className="relative flex items-center justify-center w-36 h-36">
                {/* SVG Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-slate-800" strokeWidth="8" fill="transparent" 
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-violet-500" strokeWidth="8" fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * classAnalytics.task_completion_rate) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-white font-heading">
                    {classAnalytics.task_completion_rate}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    Completed
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 bg-slate-950/50 p-3 rounded-xl border border-slate-850 w-full text-left">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Task</span>
                <span className="text-xs font-bold text-slate-300">Predict bulb brightness (POE)</span>
                <span className="text-[10px] text-slate-400 font-semibold mt-1">18 of 24 students finished</span>
              </div>
            </div>

            {/* Quick class summary stats */}
            <div className="glass-panel p-5 flex flex-col gap-4">
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Class Summary</h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center p-3 rounded-lg border border-slate-900 bg-slate-950/20">
                  <span className="text-xs font-semibold text-slate-400">Class Average</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">2.1 / 3.0</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-slate-900 bg-slate-950/20">
                  <span className="text-xs font-semibold text-slate-400">Active Chapters</span>
                  <span className="text-xs font-bold text-violet-400">4 Chapters</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border border-slate-900 bg-slate-950/20">
                  <span className="text-xs font-semibold text-slate-400">Weakest Dimension</span>
                  <span className="text-xs font-bold text-amber-400">Reasoning (1.8)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CHAPTER DRILL */}
      {view === 'chapter' && chapterAnalytics && (
        <div className="flex flex-col gap-6 animate-fade-in pb-16">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView('overview')}
              className="text-xs text-violet-400 hover:text-violet-300 font-bold uppercase tracking-wider"
            >
              &larr; Class Overview
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400 font-semibold">{selectedChapterTitle}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Distribution metrics */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Understanding Distribution Bar Graph */}
              <div className="glass-panel p-5 flex flex-col gap-4">
                <h3 className="font-bold text-slate-200 text-sm font-heading flex items-center gap-2">
                  <CircleDot size={16} className="text-violet-400" />
                  Score Distribution: Understanding, Reasoning, Expression
                </h3>

                <div className="flex flex-col gap-6 mt-4">
                  {/* Understanding bar row */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-400">Conceptual Understanding</span>
                    <div className="flex gap-1 h-6 bg-slate-950 border border-slate-850 rounded-lg overflow-hidden relative">
                      <div className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-bold" style={{ width: '8.3%' }}>0</div>
                      <div className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-bold" style={{ width: '20.8%' }}>1</div>
                      <div className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold" style={{ width: '50.0%' }}>2</div>
                      <div className="bg-cyan-500 h-full flex items-center justify-center text-[10px] font-bold" style={{ width: '20.8%' }}>3</div>
                    </div>
                  </div>

                  {/* Reasoning bar row */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-400">Scientific Reasoning & POE</span>
                    <div className="flex gap-1 h-6 bg-slate-950 border border-slate-850 rounded-lg overflow-hidden relative">
                      <div className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-bold" style={{ width: '12.5%' }}>0</div>
                      <div className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-bold" style={{ width: '33.3%' }}>1</div>
                      <div className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold" style={{ width: '41.7%' }}>2</div>
                      <div className="bg-cyan-500 h-full flex items-center justify-center text-[10px] font-bold" style={{ width: '12.5%' }}>3</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 items-center justify-center text-[10px] font-bold uppercase mt-2 text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Score 0 (Poor)</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Score 1 (Partial)</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Score 2 (Strong)</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-cyan-500" /> Score 3 (Mastery)</span>
                </div>
              </div>

              {/* Student Scores table */}
              <div className="glass-panel p-5 flex flex-col gap-4">
                <h3 className="font-bold text-slate-200 text-sm font-heading flex items-center gap-2">
                  <Users size={16} className="text-cyan-400" />
                  Student Scorecard
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-2">Student Name</th>
                        <th className="py-2 text-center">Understanding</th>
                        <th className="py-2 text-center">Reasoning</th>
                        <th className="py-2 text-center">Expression</th>
                        <th className="py-2 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-xs">
                      {chapterAnalytics.student_scores.map(stu => (
                        <tr 
                          key={stu.student_id}
                          onClick={() => {
                            setSelectedStudentId(stu.student_id);
                            setSelectedStudentName(stu.student_name);
                            setView('student');
                          }}
                          className="hover:bg-slate-950/40 cursor-pointer"
                        >
                          <td className="py-3 font-bold text-slate-300">{stu.student_name}</td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold ${getScoreColor(stu.understanding)}`}>
                              {stu.understanding}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold ${getScoreColor(stu.reasoning)}`}>
                              {stu.reasoning}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold ${getScoreColor(stu.expression)}`}>
                              {stu.expression}
                            </span>
                          </td>
                          <td className="py-3 text-right text-violet-400 font-bold uppercase tracking-wider text-[9px]">
                            Drill Down &rarr;
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Misconceptions ranking panel */}
            <div className="glass-panel p-5 flex flex-col gap-4">
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Ranked Misconceptions
              </h3>
              
              <div className="flex flex-col gap-4">
                {chapterAnalytics.top_misconceptions.map((mis, idx) => (
                  <div key={idx} className="flex flex-col gap-2 bg-slate-950 p-4 rounded-xl border border-slate-900 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
                        Rank #{idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">{mis.percentage}% Students</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold mt-1">
                      "{mis.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: STUDENT DETAIL */}
      {view === 'student' && studentAnalytics && (
        <div className="flex flex-col gap-6 animate-fade-in pb-16">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView('overview')}
              className="text-xs text-violet-400 hover:text-violet-300 font-bold uppercase tracking-wider"
            >
              &larr; Overview
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400 font-semibold">{selectedStudentName}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Student stats metrics & excerpts */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Score Timeline Line Graph */}
              <div className="glass-panel p-5 flex flex-col gap-4">
                <h3 className="font-bold text-slate-200 text-sm font-heading flex items-center gap-2">
                  <Activity size={16} className="text-violet-400" />
                  Score Timeline Across Chapters
                </h3>
                
                {/* Scrollable timeline strip */}
                <div className="flex gap-4 overflow-x-auto py-2">
                  {studentAnalytics.score_timeline.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="min-w-48 bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col gap-3"
                    >
                      <h4 className="text-xs font-bold text-slate-200 truncate">{item.chapter_title}</h4>
                      
                      <div className="flex flex-col gap-1.5 text-[10px] font-bold text-slate-400">
                        <div className="flex justify-between">
                          <span>Understanding</span>
                          <span className="text-violet-400">{item.understanding}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reasoning</span>
                          <span className="text-cyan-400">{item.reasoning}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expression</span>
                          <span className="text-emerald-400">{item.expression}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Speech Explain It conversation excerpts */}
              <div className="glass-panel p-5 flex flex-col gap-4">
                <h3 className="font-bold text-slate-200 text-sm font-heading flex items-center gap-2">
                  <Mic size={16} className="text-cyan-400" />
                  Recent Explain It Excerpts (Teach the AI)
                </h3>

                <div className="flex flex-col gap-3">
                  {studentAnalytics.explain_excerpts.map((exc, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        exc.is_strong 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' 
                          : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 text-[9px] font-bold uppercase tracking-widest">
                        <span>Concept: {exc.concept}</span>
                        <span className={exc.is_strong ? 'text-emerald-400' : 'text-rose-400'}>
                          {exc.is_strong ? 'Strong Articulation' : 'Conceptual Gap'}
                        </span>
                      </div>
                      <p className="text-xs italic leading-relaxed text-slate-200">
                        {exc.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Language ratio, POE accuracy and misconceptions logs */}
            <div className="flex flex-col gap-6">
              
              {/* Language Ratio & Accuracy */}
              <div className="glass-panel p-5 flex flex-col gap-5">
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Voice Session Metrics
                </h3>

                {/* Prediction Accuracy percentage */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-center flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Prediction Accuracy Rate</span>
                  <span className="text-3xl font-extrabold text-cyan-400 font-heading">{studentAnalytics.prediction_accuracy}%</span>
                  <span className="text-[9px] text-slate-500">From Predict It (POE) exercises</span>
                </div>

                {/* Language ratio bar */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Language Ratio (Voice session)</span>
                  <div className="h-5 rounded-lg overflow-hidden flex text-[10px] font-bold text-center border border-slate-850">
                    <div className="bg-violet-600 text-white flex items-center justify-center" style={{ width: `${studentAnalytics.language_ratio.hindi * 100}%` }}>
                      HI {(studentAnalytics.language_ratio.hindi * 100).toFixed(0)}%
                    </div>
                    <div className="bg-cyan-600 text-white flex items-center justify-center" style={{ width: `${studentAnalytics.language_ratio.english * 100}%` }}>
                      EN {(studentAnalytics.language_ratio.english * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Misconception History */}
              <div className="glass-panel p-5 flex flex-col gap-4">
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Misconception Log
                </h3>

                <div className="flex flex-col gap-3">
                  {studentAnalytics.misconceptions_history.map((mis, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-lg border border-slate-900 bg-slate-950/40 flex flex-col gap-1.5"
                    >
                      <p className="text-xs text-slate-300 leading-normal font-semibold">"{mis.text}"</p>
                      
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider mt-1">
                        <span className={mis.status === 'corrected' ? 'text-emerald-400' : 'text-rose-400'}>
                          {mis.status}
                        </span>
                        {mis.resolved_chapter && (
                          <span className="text-slate-500">Resolved in: {mis.resolved_chapter}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
