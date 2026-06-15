import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Pause, X, ChevronRight, Monitor, Video, Sliders } from 'lucide-react';
import { VideoPlayer } from '../../components/VideoPlayer';
import { SimulationPlayer } from '../../components/SimulationPlayer';

export const BroadcastMode: React.FC = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const [contentType, setContentType] = useState<'video' | 'simulation'>('simulation');
  const [isPlaying, setIsPlaying] = useState(true);

  const handleEndPresentation = () => {
    navigate(`/teacher/class/${classId}`);
  };

  const handleNext = () => {
    setContentType(prev => prev === 'video' ? 'simulation' : 'video');
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col justify-between p-6 z-50 animate-fade-in text-white select-none">
      
      {/* Upper Status bar */}
      <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-white animate-pulse">
            <Monitor size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight font-heading">Projector Broadcast Active</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Display Mode: {contentType === 'video' ? 'Concept Animation' : 'Interactive Lab Simulation'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 p-1 rounded-lg">
          <button
            onClick={() => setContentType('video')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              contentType === 'video' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <Video size={14} /> Video
          </button>
          <button
            onClick={() => setContentType('simulation')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              contentType === 'simulation' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <Sliders size={14} /> Simulation
          </button>
        </div>
      </div>

      {/* Main Full-Screen Content Area */}
      <div className="flex-1 w-full flex items-center justify-center p-4">
        <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-900 shadow-2xl flex items-center justify-center p-2 relative">
          {contentType === 'video' ? (
            <VideoPlayer url={null} title="Electric Current & Drift Velocity — Projection View" autoplay={isPlaying} />
          ) : (
            <SimulationPlayer title="Projector Lab: Ohm's Law Sandbox" />
          )}
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-full px-6 py-3.5 flex items-center justify-between shadow-2xl backdrop-blur-md mb-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <button
          onClick={handleEndPresentation}
          className="bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600/30 text-rose-200 px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <X size={15} />
          <span>End Presentation</span>
        </button>

        <button
          onClick={handleNext}
          className="bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors"
          title="Switch Content Piece"
        >
          <span>Next Item</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};
