import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, HelpCircle, Film, Sparkles, Send, Check, 
  AlertTriangle, Volume2, Info, ChevronRight, X 
} from 'lucide-react';
import { api } from '../../api';
import { VideoPlayer } from '../../components/VideoPlayer';
import { VoiceRecorder } from '../../components/VoiceRecorder';

export const DoubtFlow: React.FC = () => {
  const navigate = useNavigate();

  // Step state:
  // 1: Enter doubt text/voice
  // 2: Tried/Lost split question
  // 3: Describe attempt (If Yes) or Play Concept Video (If No)
  // 4: Play targeted clarification video
  // 5: Did this help? question
  // 6: Text follow-up panel (If did not help)
  const [step, setStep] = useState(1);

  // Doubt Data
  const [doubtText, setDoubtText] = useState('');
  const [attemptText, setAttemptText] = useState('');
  const [triedBefore, setTriedBefore] = useState<boolean | null>(null);
  const [followUpText, setFollowUpText] = useState('');
  const [followUpResponse, setFollowUpResponse] = useState('');
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  // Quota states
  const [quota, setQuota] = useState({ used: 2, max: 5 });
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);

  useEffect(() => {
    async function loadQuota() {
      try {
        const q = await api.getDoubtQuotas();
        setQuota(q);
      } catch (e) {
        console.error(e);
      }
    }
    loadQuota();
  }, []);

  const handleNextDoubt = (text: string) => {
    setDoubtText(text);
    setStep(2);
  };

  const handleTriedSplit = (tried: boolean) => {
    setTriedBefore(tried);
    if (tried) {
      setStep(3); // Go to describe attempt
    } else {
      setStep(3); // Go to play concept video first
    }
  };

  const handleAttemptSubmitted = (text: string) => {
    setAttemptText(text);
    triggerVideoGeneration();
  };

  const triggerVideoGeneration = async () => {
    if (quota.used >= quota.max) {
      setQuotaExceeded(true);
      return;
    }

    setLoadingVideo(true);
    setStep(4);

    try {
      await api.saveDoubt({
        text: doubtText
      });
      const q = await api.getDoubtQuotas();
      setQuota(q);
    } catch (e) {
      console.warn("Backend saveDoubt failed, using local mock", e);
      api.useDoubtQuota();
      try {
        const q = await api.getDoubtQuotas();
        setQuota(q);
      } catch (err) {}

      // local fallback
      try {
        await api.saveDoubt({
          doubt_id: 'd_' + Date.now(),
          student_id: 's1',
          student_name: 'Rahul Kumar',
          topic: 'Electric Current',
          text: doubtText,
          video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
          status: 'pending',
          created_at: new Date().toISOString()
        });
      } catch (err) {}
    } finally {
      setLoadingVideo(false);
    }
  };


  const handleConceptVideoFinished = () => {
    // Prompt: "Now do you have a question?" -> proceeds like the Yes path
    setTriedBefore(true);
    setStep(3);
  };

  const handleHelpFeedback = (helped: boolean) => {
    if (helped) {
      // Close flow and return home
      navigate('/student/home');
    } else {
      setStep(6); // Go to text follow up
    }
  };

  const handleSendFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpText) return;
    setSubmittingFollowUp(true);

    setTimeout(() => {
      setFollowUpResponse("Ah, I understand where the confusion lies. A resistor hinders electron flow but doesn't block it completely. The electrons drift more slowly, which reduces the rate of current (coulombs per second) flowing through the circuit, but the circuit loop remains intact.");
      setSubmittingFollowUp(false);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#07070c] relative z-10 p-6 md:p-8">
      <div className="grid-overlay" />
      <div className="ambient-light" />

      {/* Quota Counter at Top */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-900 pb-4 max-w-2xl w-full mx-auto">
        <button
          onClick={() => navigate('/student/home')}
          className="text-slate-400 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Exit Doubt Session</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-full">
          <Info size={13} className="text-violet-400" />
          <span>{quota.max - quota.used} of {quota.max} Doubt Videos Left Today</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl bg-slate-950/40 border border-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
          
          {/* QUOTA EXCEEDED BLOCKER */}
          {quotaExceeded ? (
            <div className="flex flex-col items-center text-center gap-6 animate-fade-in py-4">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center animate-bounce">
                <AlertTriangle size={26} />
              </div>
              <h2 className="text-xl font-bold text-slate-200 font-heading">Daily Limit Reached</h2>
              <p className="text-xs text-slate-550 max-w-sm leading-relaxed">
                You've explored a lot today! Your doubt video quota resets tomorrow. Try rewatching the concept video or exploring the concept simulator.
              </p>
              <button
                onClick={() => navigate('/student/home')}
                className="btn-primary py-2 px-6 mt-2"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* STEP 1: DESCRIBE DOUBT */}
              {step === 1 && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-xl">
                      <HelpCircle size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-200 font-heading">Describe Your Doubt</h2>
                      <p className="text-slate-500 text-[10px] mt-0.5 font-semibold">Speak or type whatever concept you are stuck on</p>
                    </div>
                  </div>

                  <VoiceRecorder 
                    onRecordingComplete={handleNextDoubt}
                    placeholderText="Press mic and tell me what is confusing you..."
                  />

                  <div className="flex items-center justify-center my-1 text-slate-700 text-xs font-bold uppercase">
                    <span>- or -</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Why does resistance decrease when voltage increases?"
                      value={doubtText}
                      onChange={(e) => setDoubtText(e.target.value)}
                      className="form-input flex-1 bg-slate-900 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleNextDoubt(doubtText);
                      }}
                    />
                    <button
                      onClick={() => handleNextDoubt(doubtText)}
                      disabled={!doubtText}
                      className="btn-primary py-1.5 px-3 text-xs"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: TRIED/LOST SPLIT */}
              {step === 2 && (
                <div className="flex flex-col items-center text-center gap-6 animate-fade-in py-2">
                  <h3 className="font-bold text-slate-200 text-md font-heading leading-snug max-w-sm">
                    Have you already tried working through this?
                  </h3>
                  
                  <div className="flex gap-3 w-full mt-4">
                    <button
                      onClick={() => handleTriedSplit(false)}
                      className="btn-secondary flex-1 py-3 text-xs font-bold"
                    >
                      No, Completely Lost
                    </button>
                    <button
                      onClick={() => handleTriedSplit(true)}
                      className="btn-primary flex-1 py-3 text-xs font-bold bg-gradient-to-r from-rose-500 to-orange-500 border-none shadow-lg shadow-rose-500/15"
                    >
                      Yes, Tried Something
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DESCRIBE ATTEMPT (TRIED) OR PLAY INTRO VIDEO (LOST) */}
              {step === 3 && triedBefore === true && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <h3 className="font-bold text-slate-200 text-sm font-heading">
                    Tell me what you tried:
                  </h3>

                  <VoiceRecorder 
                    onRecordingComplete={handleAttemptSubmitted}
                    placeholderText="Tell me what you calculated or did..."
                  />

                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="e.g. I tried connecting battery directly but bulb didn't glow..."
                      value={attemptText}
                      onChange={(e) => setAttemptText(e.target.value)}
                      className="form-input flex-1 bg-slate-900 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAttemptSubmitted(attemptText);
                      }}
                    />
                    <button
                      onClick={() => handleAttemptSubmitted(attemptText)}
                      disabled={!attemptText}
                      className="btn-primary py-1.5 px-3 text-xs"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && triedBefore === false && (
                <div className="flex flex-col gap-5 animate-fade-in">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <Film size={16} className="text-violet-400" />
                    <h3 className="font-bold text-slate-200 text-sm font-heading">Watch Explainer First</h3>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed">
                    Let's start from the beginning. Watch this concept video to refresh the circuit fundamentals:
                  </p>

                  <div className="w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-850 p-1">
                    <VideoPlayer url={null} title="Circuit Basics" autoplay={true} />
                  </div>

                  <button
                    onClick={handleConceptVideoFinished}
                    className="btn-primary w-full mt-2 py-2.5 text-xs font-bold"
                  >
                    Next: Ask Your Doubt
                  </button>
                </div>
              )}

              {/* STEP 4: PLAY TARGETED CLARIFICATION VIDEO */}
              {step === 4 && (
                <div className="flex flex-col gap-5 animate-fade-in">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                    <Sparkles size={16} className="text-rose-400" />
                    <h3 className="font-bold text-slate-200 text-sm font-heading">AI Clarification</h3>
                  </div>

                  {loadingVideo ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                      <span className="w-8 h-8 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider animate-pulse">
                        Analyzing attempt & drawing clarification Manim video...
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Here is a 45-second explanation targeting where your thinking broke down:
                      </p>

                      <div className="w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-850 p-1">
                        <VideoPlayer url={null} title="AI Target Clarification" autoplay={true} />
                      </div>

                      <button
                        onClick={() => setStep(5)}
                        className="btn-primary w-full mt-2 py-2.5 text-xs font-bold"
                      >
                        Next
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* STEP 5: DID THIS HELP? */}
              {step === 5 && (
                <div className="flex flex-col items-center text-center gap-6 animate-fade-in py-2">
                  <h3 className="font-bold text-slate-200 text-md font-heading">
                    Did this clarification help?
                  </h3>

                  <div className="flex gap-3 w-full mt-4">
                    <button
                      onClick={() => handleHelpFeedback(false)}
                      className="btn-secondary flex-1 py-3 text-xs font-bold"
                    >
                      No, Still Stuck
                    </button>
                    <button
                      onClick={() => handleHelpFeedback(true)}
                      className="btn-primary flex-1 py-3 text-xs font-bold"
                    >
                      Yes, Thanks!
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: TEXT FOLLOW-UP RESPONSE */}
              {step === 6 && (
                <div className="flex flex-col gap-4 animate-fade-in text-left">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <h3 className="font-bold text-slate-200 text-sm font-heading">Text Follow-up</h3>
                    <button 
                      onClick={() => navigate('/student/home')}
                      className="text-slate-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 max-h-60 overflow-y-auto bg-slate-950/60 p-4 rounded-xl border border-slate-900 text-xs">
                    <div className="bg-slate-900/60 text-slate-350 p-3 rounded-xl border border-slate-850">
                      Query: "{doubtText}"
                    </div>

                    {followUpResponse && (
                      <div className="bg-rose-500/5 text-rose-300 border border-rose-500/20 p-3.5 rounded-xl flex items-start gap-2">
                        <div className="p-1 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-lg text-[9px] font-bold">AI</div>
                        <p className="leading-relaxed font-semibold">"{followUpResponse}"</p>
                      </div>
                    )}
                  </div>

                  {!followUpResponse && (
                    <form onSubmit={handleSendFollowUp} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask follow-up (e.g. 'But what happens to the electrons?')"
                        value={followUpText}
                        onChange={(e) => setFollowUpText(e.target.value)}
                        className="form-input flex-1 bg-slate-900 text-xs"
                      />
                      <button
                        type="submit"
                        disabled={submittingFollowUp || !followUpText}
                        className="btn-primary py-1.5 px-3 text-xs"
                      >
                        {submittingFollowUp ? '...' : <Send size={13} />}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};
