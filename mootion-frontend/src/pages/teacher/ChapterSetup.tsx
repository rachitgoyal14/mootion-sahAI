import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, Film, Sliders, MessageSquare, 
  Eye, RefreshCw, CheckCircle2, X, Box, BookOpen
} from 'lucide-react';
import { api } from '../../api';
import { ChapterInfo, ClassInfo, ChapterAsset } from '../../types';
import { VideoPlayer } from '../../components/VideoPlayer';
import { SimulationPlayer } from '../../components/SimulationPlayer';

export const ChapterSetup: React.FC = () => {
  const { classId, chapterId } = useParams<{ classId: string; chapterId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<ChapterInfo | null>(null);
  const [assets, setAssets] = useState<ChapterAsset[]>([]);
  
  // Preview and Assign States
  const [previewAsset, setPreviewAsset] = useState<ChapterAsset | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [deadline, setDeadline] = useState(() =>
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [instructionsNote, setInstructionsNote] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  // Poll controller
  const pollIntervalRef = useRef<any>(null);

  const loadData = async () => {
    if (!classId || !chapterId) return;
    try {
      // Fetch classes to trigger load check
      await api.getTeacherClasses();

      const ch = await api.getChapterDetails(classId, chapterId);
      setChapter(ch);
      if (ch.assets) {
        setAssets(ch.assets);
        
        // Auto-select all assets for assignments by default on first load
        if (selectedActivities.length === 0) {
          setSelectedActivities(ch.assets.map(a => a.asset_type));
        }

        // Check if any asset is currently generating (queued or processing)
        const needsPolling = ch.assets.some(
          a => a.generation_status === 'queued' || a.generation_status === 'processing'
        );

        if (needsPolling && !pollIntervalRef.current) {
          startPolling();
        } else if (!needsPolling && pollIntervalRef.current) {
          stopPolling();
        }
      }
    } catch (e) {
      console.error('Failed to load chapter setup details', e);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    pollIntervalRef.current = setInterval(() => {
      loadData();
    }, 3000); // Poll status every 3 seconds
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => loadData());
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, chapterId]);

  const toggleActivity = (type: string) => {
    setSelectedActivities(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAssign = async () => {
    if (!classId || !chapterId || selectedActivities.length === 0) return;
    setSubmittingAssignment(true);

    try {
      // Create backend assignments for each selected activity type
      for (const actType of selectedActivities) {
        const matchingAsset = assets.find(a => a.asset_type === actType);
        
        // Map asset types back to allowed backend assignment types
        let backendType = 'video';
        if (actType === 'simulation') backendType = 'simulation';
        if (actType === 'three_d_model') backendType = 'model';
        if (actType === 'quiz') backendType = 'quiz';
        if (actType === 'explain_it') backendType = 'explain_ai';
        if (actType === 'predict_it') backendType = 'predict_ai';
        if (actType === 'spot_it') backendType = 'spot_it';
        if (actType === 'connect_it') backendType = 'connect_it';

        await api.createAssignment(classId, {
          chapter_id: chapterId,
          assignment_type: backendType,
          title: matchingAsset?.title || 'Learning Task',
          instructions: instructionsNote || undefined
        });
      }

      navigate(`/teacher/class/${classId}`);
    } catch (e) {
      console.error(e);
      alert('Deploying assignment. Re-routing to roadmap.');
      navigate(`/teacher/class/${classId}`);
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'concept_video':
        return <Film size={20} />;
      case 'simulation':
        return <Sliders size={20} />;
      case 'three_d_model':
        return <Box size={20} />;
      case 'quiz':
        return <BookOpen size={20} />;
      default:
        return <MessageSquare size={20} />;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'placeholder':
        return 'text-slate-400 border-slate-800 bg-slate-900/40';
      case 'queued':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/5 animate-pulse';
      case 'processing':
        return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5 animate-pulse';
      case 'ready':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      default:
        return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#07070c] relative z-10 p-6">
        <span className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-3 font-bold uppercase tracking-wider animate-pulse font-mono">
          Loading Chapter Configuration...
        </span>
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
          onClick={() => navigate(`/teacher/class/${classId}`)}
          className="text-slate-400 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 self-start transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Class Roadmap</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest bg-violet-600/10 px-3 py-1 rounded-full border border-violet-500/20">
              Active Chapter Scaffolding
            </span>
            <h1 className="text-3xl font-extrabold text-slate-200 mt-2 font-heading">
              {chapter?.title || 'Chapter Configuration'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Pre-seeded assets mapped from curriculum node tree. Deploy task to launch background rendering.
            </p>
          </div>
          
          <button 
            onClick={() => setAssignOpen(true)}
            disabled={assets.length === 0}
            className="btn-primary py-3 px-6 shadow-2xl font-bold flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            <span>Assign to Class</span>
          </button>
        </div>
      </div>

      {/* Content Stack of Cards (Wired to assets) */}
      <div className="flex-1 flex flex-col gap-6 max-w-4xl w-full mx-auto pb-24">
        {assets.map(asset => (
          <div 
            key={asset.asset_id} 
            className="glass-panel p-5 flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-violet-400 flex items-center justify-center flex-shrink-0">
                  {getAssetIcon(asset.asset_type)}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-200 font-heading">{asset.title}</h4>
                    <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(asset.generation_status)}`}>
                      {asset.generation_status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-2xl">
                    {asset.description || 'Pre-configured segment template. Triggers when assigned to class.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {asset.generation_status === 'ready' && (
                  <button
                    onClick={() => setPreviewAsset(asset)}
                    className="text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-300 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                  >
                    <Eye size={13} />
                    <span>Preview</span>
                  </button>
                )}
                
                {/* Generation Job Status indicators */}
                {(asset.generation_status === 'queued' || asset.generation_status === 'processing') && (
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <RefreshCw size={12} className="animate-spin" /> Rendering...
                  </span>
                )}

                {asset.generation_status === 'placeholder' && (
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    Ready to Deploy
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ASSIGNMENT CONFIGURATION DRAWER */}
      {assignOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 flex flex-col gap-5 relative animate-slide-up">
            <button 
              onClick={() => setAssignOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-200 font-heading">Assign Chapter Activities</h3>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Include Activities</label>
                <div className="grid grid-cols-2 gap-2">
                  {assets.map(a => {
                    const included = selectedActivities.includes(a.asset_type);
                    return (
                      <button
                        key={a.asset_id}
                        onClick={() => toggleActivity(a.asset_type)}
                        className={`py-2 px-3 border rounded-lg text-xs font-semibold text-left flex items-center justify-between ${
                          included 
                            ? 'bg-violet-600/10 border-violet-500 text-violet-200' 
                            : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <span className="truncate">{a.title}</span>
                        <input type="checkbox" checked={included} readOnly className="accent-violet-500" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Submission Deadline</label>
                <input 
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="form-input bg-slate-900"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Instructions Note (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Try to explain electric circuits using real-world observations..."
                  value={instructionsNote}
                  onChange={(e) => setInstructionsNote(e.target.value)}
                  className="form-input bg-slate-900 resize-none text-xs"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4 border-t border-slate-850 pt-4">
              <button
                onClick={() => setAssignOpen(false)}
                className="btn-secondary py-2.5 flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={submittingAssignment || selectedActivities.length === 0}
                className="btn-primary py-2.5 flex-1 font-bold"
              >
                {submittingAssignment ? 'Deploying...' : 'Confirm Deploy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewAsset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-3xl glass-panel p-6 flex flex-col gap-4 relative animate-slide-up">
            <button 
              onClick={() => setPreviewAsset(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-200 font-heading">
              Preview: {previewAsset.title}
            </h3>

            <div className="flex-1 w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-850 p-2">
              {previewAsset.asset_type === 'concept_video' && (
                /* Native Video Streaming via static external URL mounted */
                <VideoPlayer url={previewAsset.external_url} title={previewAsset.title} autoplay={true} />
              )}
              
              {previewAsset.asset_type === 'simulation' && (
                <SimulationPlayer title={previewAsset.title} />
              )}
              
              {previewAsset.asset_type === 'three_d_model' && previewAsset.external_url && (
                /* Sketchfab or GLTF Viewer embedded via iframe storage mount */
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-850">
                  <iframe 
                    src={previewAsset.external_url} 
                    title="3D Model Viewer"
                    className="w-full h-full border-none" 
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                  />
                </div>
              )}

              {previewAsset.asset_type !== 'concept_video' && 
               previewAsset.asset_type !== 'simulation' && 
               previewAsset.asset_type !== 'three_d_model' && (
                <div className="p-8 text-center flex flex-col items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center font-bold">
                    AI
                  </div>
                  <h4 className="font-bold text-slate-200">{previewAsset.title}</h4>
                  <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                    This is an interactive activity slot. When assigned, the student will engage with the AI voice responder natively.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4 border-t border-slate-850 pt-4">
              <button
                onClick={() => setPreviewAsset(null)}
                className="btn-secondary py-2 px-6"
              >
                Close Preview
              </button>
              {previewAsset.asset_type === 'simulation' && (
                <button
                  onClick={() => {
                    setPreviewAsset(null);
                    navigate(`/teacher/class/${classId}/broadcast`);
                  }}
                  className="btn-primary py-2 px-6"
                >
                  Present to Class (Projector)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
