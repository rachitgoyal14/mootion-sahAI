import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Clock, Play, AlertCircle, RefreshCw, 
  BookOpen, Calendar, HelpCircle, FileText, CheckCircle2 
} from 'lucide-react';
import { api } from '../../api';
import { StudentTask } from '../../types';

export const MyTasks: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [classId, setClassId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const cls = await api.getStudentClasses();
        if (cls.length > 0) {
          const firstClassId = cls[0].class_id;
          setClassId(firstClassId);
          const tsk = await api.getStudentAssignments(firstClassId);
          setTasks(tsk);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'concept_video':
      case 'video':
        return <Play size={16} className="text-violet-400" />;
      case 'explain_it':
      case 'explain_ai':
        return <FileText size={16} className="text-cyan-400" />;
      default:
        return <HelpCircle size={16} className="text-amber-400" />;
    }
  };

  const getStatusBadge = (status: string, score?: number) => {
    if (status === 'completed') {
      return (
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 size={11} /> Score: {score || 3}/3
        </span>
      );
    }
    if (status === 'in_progress') {
      return (
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
          <Clock size={11} /> In Progress
        </span>
      );
    }
    return (
      <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
        Not Started
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#07070c] relative z-10">
        <span className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-3 font-bold uppercase tracking-wider animate-pulse">Retrieving Homework Tasks...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#07070c] relative z-10 p-6 md:p-8">
      <div className="grid-overlay" />
      <div className="ambient-light" />

      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <button
          onClick={() => navigate('/student/home')}
          className="text-slate-400 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-600/30">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 font-heading">My Assignments</h1>
            <p className="text-slate-400 text-xs mt-0.5">Assigned learning sessions sorted by deadline</p>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 flex flex-col gap-4 max-w-3xl w-full mx-auto pb-24">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.assignment_id}
              className="glass-panel p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-5 hover:border-slate-800 transition-colors"
            >
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center">
                  {getIcon(task.assignment_type)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">
                    {task.chapter_title}
                  </span>
                  <h3 className="font-bold text-slate-200 text-sm mt-0.5 font-heading">
                    {task.title}
                  </h3>
                  <div className="flex gap-4 mt-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-650" />
                      Due: {task.deadline}
                    </span>
                    <span>{getStatusBadge(task.status, task.attempts?.[0]?.understanding)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {task.status === 'completed' ? (
                  <button
                    onClick={() => navigate(`/student/class/${classId}/task/${task.assignment_id}`)}
                    className="text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-350 px-4 py-2 rounded-lg font-bold flex items-center gap-1 transition-all"
                  >
                    <RefreshCw size={12} />
                    <span>Try Again</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/student/class/${classId}/task/${task.assignment_id}`)}
                    className="btn-primary py-2 px-5 text-xs font-bold"
                  >
                    <span>{task.status === 'in_progress' ? 'Continue' : 'Start'}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
            <CheckCircle size={48} className="text-emerald-500 mb-3" />
            <h4 className="font-bold text-slate-300 font-heading">All Clear! No Pending Work</h4>
            <p className="text-slate-500 text-xs mt-1">
              You've completed everything! Time to play and generate items in the Playground.
            </p>
          </div>
        )}
      </div>

      {/* FLOATING "I'M STUCK" FLOATER */}
      {tasks.length > 0 && (
        <button
          onClick={() => navigate('/student/doubt')}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform z-40"
          title="Doubt Flow: I'm Stuck!"
        >
          <HelpCircle size={24} />
        </button>
      )}
    </div>
  );
};
