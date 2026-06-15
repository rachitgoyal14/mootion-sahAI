import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, Video, Sliders, Info, Send, 
  RefreshCw, CheckCircle2, AlertCircle, Play 
} from 'lucide-react';
import { api } from '../../api';
import { VideoPlayer } from '../../components/VideoPlayer';
import { SimulationPlayer } from '../../components/SimulationPlayer';

export const PlaygroundMode: React.FC = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [genType, setGenType] = useState<'video' | 'simulation' | 'three_d_model'>('video');
  const [generating, setGenerating] = useState(false);
  const [generatedItem, setGeneratedItem] = useState<{ type: 'video' | 'simulation' | 'three_d_model'; topic: string; url?: string | null } | null>(null);

  // Quota states
  const [quota, setQuota] = useState({ used: 4, max: 10 });
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    async function loadQuota() {
      try {
        const q = await api.getPlaygroundQuotas();
        setQuota(q);
      } catch (e) {
        console.error(e);
      }
    }
    loadQuota();
  }, []);

  const handleGenerate = async () => {
    if (!topic) return;

    if (quota.used >= quota.max) {
      setQuotaExceeded(true);
      return;
    }

    setGenerating(true);
    setGeneratedItem(null);

    try {
      const res = await api.generatePlayground(topic, genType);
      if (res && res.success) {
        const q = await api.getPlaygroundQuotas();
        setQuota(q);
        setGeneratedItem({
          type: res.asset_type,
          topic: topic,
          url: res.external_url
        });
      } else {
        alert(res?.error_message || "Generation failed. Try another topic.");
      }
    } catch (e) {
      console.warn("Backend playground generation failed, falling back to mock", e);
      api.usePlaygroundQuota();
      try {
        const q = await api.getPlaygroundQuotas();
        setQuota(q);
      } catch (err) {}
      setGeneratedItem({
        type: genType,
        topic: topic,
        url: genType === 'video' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : null
      });
    } finally {
      setGenerating(false);
      setTopic('');
    }
  };


  return (
    <div className="flex-1 flex flex-col bg-[#07070c] relative z-10 p-6 md:p-8">
      <div className="grid-overlay" />
      <div className="ambient-light" />

      {/* Quota Counter */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4 max-w-3xl w-full mx-auto">
        <button
          onClick={() => navigate('/student/home')}
          className="text-slate-400 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Exit Playground</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-full">
          <Sparkles size={13} className="text-cyan-400 animate-pulse" />
          <span>{quota.max - quota.used} of {quota.max} Playground Generations Left This Week</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl w-full mx-auto pb-24">
        {quotaExceeded ? (
          <div className="w-full max-w-md glass-panel p-6 flex flex-col items-center text-center gap-6 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center animate-bounce">
              <AlertCircle size={26} />
            </div>
            <h2 className="text-xl font-bold text-slate-200 font-heading">Weekly Limit Reached</h2>
            <p className="text-xs text-slate-550 max-w-sm leading-relaxed">
              You've explored a lot this week! Your Playground resets on Monday. Keep up the curious spirit!
            </p>
            <button
              onClick={() => navigate('/student/home')}
              className="btn-primary py-2 px-6 mt-2"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-6">
            {/* Topic Prompter Bar */}
            <div className="glass-panel p-5 flex flex-col gap-4">
              <h3 className="font-bold text-slate-250 text-sm font-heading flex items-center gap-1.5">
                <Sparkles size={16} className="text-cyan-400" />
                What science concept do you want to explore?
              </h3>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="e.g. Electromagnetic induction, Gravitation force, Light reflection..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={generating}
                  className="form-input flex-1 bg-slate-900 text-xs font-semibold"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerate();
                  }}
                />
                
                <div className="flex gap-2">
                  <select
                    value={genType}
                    onChange={(e) => setGenType(e.target.value as any)}
                    disabled={generating}
                    className="form-input bg-slate-900 text-xs font-bold"
                  >
                    <option value="video">Concept Video</option>
                    <option value="simulation">Simulation Lab (PhET)</option>
                    <option value="three_d_model">3D Model (Sketchfab)</option>
                  </select>

                  <button
                    onClick={handleGenerate}
                    disabled={generating || !topic}
                    className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1"
                  >
                    {generating ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* GENERATING LOAD STATE */}
            {generating && (
              <div className="glass-panel p-10 flex flex-col items-center justify-center text-center gap-4 animate-pulse border-cyan-500/20">
                <span className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-555 rounded-full animate-spin" />
                <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
                  AI Synthesizing educational assets for: "{topic}"
                </h4>
              </div>
            )}

            {/* DISPLAY GENERATED CONTENT */}
            {generatedItem && !generating && (
              <div className="flex flex-col gap-3 animate-fade-in">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                    Generated Item
                  </span>
                  <span className="text-xs text-slate-500 font-semibold font-mono">
                    Topic: {generatedItem.topic}
                  </span>
                </div>

                <div className="w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-900 p-2 shadow-2xl">
                  {generatedItem.type === 'video' ? (
                    <VideoPlayer url={generatedItem.url || null} title={`Explainer: ${generatedItem.topic}`} autoplay={true} />
                  ) : generatedItem.type === 'simulation' ? (
                    <SimulationPlayer url={generatedItem.url || undefined} title={`Simulation Lab: ${generatedItem.topic}`} />
                  ) : (
                    <SimulationPlayer url={generatedItem.url || undefined} title={`3D Model: ${generatedItem.topic}`} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
