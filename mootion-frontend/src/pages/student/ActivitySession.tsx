import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, BookOpen, Film, 
  CheckCircle2, ChevronRight, Check, X,
  Sliders, Compass, Info, Send, Award, Layers
} from 'lucide-react';
import { api } from '../../api';
import { StudentTask } from '../../types';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { VideoPlayer } from '../../components/VideoPlayer';
import { SimulationPlayer } from '../../components/SimulationPlayer';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

// 3D Atomic Bohr Model Visualizer for UNIVERSE Tab
const AtomVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#090910';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Outer glow effect
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Orbit lines
      ctx.lineWidth = 1;
      const drawOrbit = (rx: number, ry: number, rot: number, color: string, speed: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Electron particle
        const t = angle * speed;
        const ex = rx * Math.cos(t);
        const ey = ry * Math.sin(t);

        // Glow path
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(ex, ey, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ex, ey, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
      };

      // Orbiting electrons
      drawOrbit(95, 32, Math.PI / 6, '#06b6d4', 1.8);
      drawOrbit(105, 38, -Math.PI / 5, '#8b5cf6', 1.3);
      drawOrbit(85, 42, Math.PI / 2.3, '#f53f5e', 2.2);

      // Draw Nucleus (Protons & Neutrons clustered)
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#8b5cf6';
      
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444'; // Proton Red
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx - 7, cy + 4, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#8b5cf6'; // Neutron Violet
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx + 6, cy - 4, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4'; // Neutron Cyan
      ctx.fill();

      angle += 0.008;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[350px] bg-[#090910] border border-slate-900 rounded-xl overflow-hidden shadow-inner relative flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4 bg-slate-900/95 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-800 shadow-md flex items-center gap-1.5">
        <Sparkles size={11} className="text-violet-400 animate-pulse" />
        <span>3D Micro Atomic Universe</span>
      </div>
      <canvas ref={canvasRef} width={380} height={280} className="w-full h-full max-h-[350px] max-w-full" />
    </div>
  );
};

export const ActivitySession: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<StudentTask | null>(null);

  // Active step: 1 (Setup), 2 (Input/Active), 3 (Typing/Simulating), 4 (Results)
  const [sessionStep, setSessionStep] = useState(1);

  // Layout Tab toggles
  const [visualTab, setVisualTab] = useState<'storyboard' | 'playground' | 'universe'>('storyboard');
  const [practiceTab, setPracticeTab] = useState<'prove_it' | 'challenge' | 'flashcards'>('challenge');
  const [mobileTab, setMobileTab] = useState<'visual' | 'chat' | 'practice'>('chat');

  // AI voice/chat states
  const [dialogue, setDialogue] = useState<{ sender: 'ai' | 'user'; text: string }[]>([]);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [aiTyping, setAiTyping] = useState(false);
  const [textInput, setTextInput] = useState('');

  // Interactive study flashcards state
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const sampleQuizQuestions: QuizQuestion[] = [
    {
      question: "Which of the following materials is a good conductor of electricity?",
      options: ["Rubber", "Copper", "Glass", "Wood"],
      correctAnswer: 1
    },
    {
      question: "What is the SI unit of electric current?",
      options: ["Volt", "Ohm", "Ampere", "Joule"],
      correctAnswer: 2
    },
    {
      question: "What happens to the current in a circuit if resistance is doubled and voltage stays constant?",
      options: ["Doubles", "Stays the same", "Halves", "Becomes zero"],
      correctAnswer: 2
    }
  ];

  // Dynamic Quiz Questions
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(sampleQuizQuestions);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Results State
  const [scores, setScores] = useState({ u: 2, r: 2, e: 2 });
  const [aiObservation, setAiObservation] = useState('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogue, aiTyping]);

  useEffect(() => {
    async function loadData() {
      if (!taskId) return;
      try {
        const cls = await api.getStudentClasses();
        if (cls.length > 0) {
          const tsk = await api.getStudentAssignments(cls[0].class_id);
          const found = tsk.find(t => t.assignment_id === taskId);
          if (found) {
            setTask(found);
            
            // Auto switch tabs depending on task type
            if (found.assignment_type === 'quiz') {
              setPracticeTab('prove_it');
            } else {
              setPracticeTab('challenge');
            }

            // Set up initial AI message based on task type
            let initMessage = '';
            if (found.assignment_type === 'explain_it' || found.assignment_type === 'explain_ai') {
              initMessage = "Hello! Explain the concept of Electric Current to me as if I'm a younger student who has never heard of it. Take your time.";
            } else if (found.assignment_type === 'predict_it' || found.assignment_type === 'predict_ai') {
              initMessage = "Look at the circuit simulator on the left. What do you think will happen to the current flow when we increase the battery voltage to 9V? Tell me your prediction.";
            } else if (found.assignment_type === 'spot_it') {
              initMessage = "Why does a bicycle pump get warm when you pump air into a tire? Which concept from this chapter explains this?";
            } else {
              initMessage = "Look at these cards: 'Electric Current' and 'Resistance'. Explain how these two concepts are connected. What's the relationship?";
            }
            setDialogue([{ sender: 'ai', text: initMessage }]);

            // Query dynamic quiz questions from the backend if available
            if (found.assignment_type === 'quiz') {
              try {
                const details = await api.getAssignmentDetails(cls[0].class_id, taskId!);
                const quizJob = details.jobs?.find(j => j.asset_type === 'quiz' && j.status === 'ready');
                if (quizJob && quizJob.result_json && quizJob.result_json.questions) {
                  setQuizQuestions(quizJob.result_json.questions);
                }
              } catch (e) {
                console.warn("Using baseline sample quiz questions", e);
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [taskId]);

  const handleStartActivity = () => {
    setSessionStep(2);
  };

  const handleVoiceTranscribed = (text: string) => {
    if (!text.trim()) return;
    setDialogue(prev => [...prev, { sender: 'user', text }]);
    setSessionStep(3);
    setAiTyping(true);

    setTimeout(() => {
      setAiTyping(false);
      const nextExchange = exchangeCount + 1;
      setExchangeCount(nextExchange);

      const maxExchanges = (task?.assignment_type === 'explain_it' || task?.assignment_type === 'explain_ai') ? 3 : 1;

      if (nextExchange >= maxExchanges) {
        generateScorecard(false);
      } else {
        let probe = '';
        if (task?.assignment_type === 'explain_it' || task?.assignment_type === 'explain_ai') {
          const probes = [
            "That's a good start. But what actually moves inside the wire? Can you explain what electrons do?",
            "Ah! So the battery pushes them. What happens to the electron flow if we add a resistor in their path?"
          ];
          probe = probes[nextExchange - 1];
        } else {
          probe = "Does the rate of current flow change? Why or why not?";
        }
        setDialogue(prev => [...prev, { sender: 'ai', text: probe }]);
        setSessionStep(2); 
      }
    }, 1500);
  };

  const handleSendText = () => {
    if (!textInput.trim()) return;
    const txt = textInput;
    setTextInput('');
    handleVoiceTranscribed(txt);
  };

  const handleQuizSubmit = () => {
    if (selectedOption === null) return;
    
    const correct = selectedOption === quizQuestions[currentQuizIndex].correctAnswer;
    if (correct) {
      setQuizScore(s => s + 1);
    }
    setQuizSubmitted(true);
  };

  const handleQuizNext = () => {
    setSelectedOption(null);
    setQuizSubmitted(false);
    
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(i => i + 1);
    } else {
      generateScorecard(true);
    }
  };

  const generateScorecard = async (isQuiz: boolean) => {
    setLoading(true);
    const finalScore = isQuiz ? Math.round((quizScore / quizQuestions.length) * 3) : 2;
    let u = finalScore;
    let r = isQuiz ? finalScore : 2;
    let e = 3;
    let obs = '';

    if (isQuiz) {
      obs = `You scored ${quizScore} out of ${quizQuestions.length} correct. Excellent review of the chapter principles. Keep practicing key formulas.`;
      if (task) {
        try {
          await api.submitTaskAttempt(task.assignment_id, {
            attempt_id: 'att_' + Date.now(),
            date: new Date().toLocaleDateString(),
            understanding: u,
            reasoning: r,
            expression: e,
            feedback: obs
          });
        } catch (err) {
          console.warn("Local storage submission failed", err);
        }
      }
    } else {
      const userText = dialogue.filter(d => d.sender === 'user').map(d => d.text).join('\n');
      if (task) {
        try {
          const res = await api.submitTaskAttempt(task.assignment_id, {
            attempt_id: 'att_' + Date.now(),
            date: new Date().toLocaleDateString(),
            understanding: u,
            reasoning: r,
            expression: e,
            feedback: obs,
            transcription_text: userText
          });
          if (res) {
            u = res.score_understanding;
            r = res.score_reasoning;
            e = res.score_expression;
            obs = res.ai_feedback;
          }
        } catch (err) {
          console.error("Grading failed, falling back to mock description", err);
          if (task?.assignment_type === 'explain_it' || task?.assignment_type === 'explain_ai') {
            obs = "You explained the flow mechanism clearly. You articulated electron movement correctly. You didn't address what happens when resistance changes, but the core description is strong.";
          } else if (task?.assignment_type === 'predict_it' || task?.assignment_type === 'predict_ai') {
            obs = "Your prediction was correct. You reasoned that higher voltage increases electron drift velocity, which matches Ohm's law. Excellent deduction.";
          } else {
            obs = "Strong connection identified. You explained the correlation clearly and linked current density to heat dissipation successfully.";
          }
        }
      }
    }

    setScores({ u, r, e });
    setAiObservation(obs);
    setLoading(false);
    setSessionStep(4);
  };

  const handleDone = () => {
    navigate('/student/tasks');
  };

  const handleTryAgain = () => {
    setDialogue([dialogue[0]]);
    setExchangeCount(0);
    setQuizScore(0);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setSessionStep(1);
  };

  const getScoreLabel = (score: number) => {
    if (score === 0) return 'Poor';
    if (score === 1) return 'Partial';
    if (score === 2) return 'Strong';
    return 'Mastery';
  };

  const getFlashcards = (chapterTitle: string) => {
    const title = (chapterTitle || '').toLowerCase();
    if (title.includes('elect') || title.includes('current') || title.includes('circuit')) {
      return [
        { term: "Electric Current (I)", definition: "The rate of flow of electric charge through a conductor's cross-section. Measured in Amperes (A)." },
        { term: "Voltage (V)", definition: "The potential difference or electrical pressure that drives charge carriers through a circuit. Measured in Volts (V)." },
        { term: "Resistance (R)", definition: "The opposition that a substance offers to the flow of electric current. Measured in Ohms (Ω)." },
        { term: "Ohm's Law", definition: "States that current is directly proportional to voltage and inversely proportional to resistance: I = V / R." }
      ];
    } else if (title.includes('light') || title.includes('optics') || title.includes('reflect') || title.includes('refract')) {
      return [
        { term: "Reflection", definition: "The bouncing back of light rays when they strike a polished, reflective surface." },
        { term: "Refraction", definition: "The bending of light as it passes obliquely from one transparent medium to another of different optical density." },
        { term: "Focal Length", definition: "The distance from the center of a lens or mirror to its focal point where parallel rays converge." },
        { term: "Snell's Law", definition: "The ratio of the sine of angle of incidence to sine of angle of refraction is a constant (refractive index): n = sin i / sin r." }
      ];
    } else {
      return [
        { term: "Hypothesis", definition: "A proposed, testable explanation for a scientific phenomenon based on observation and reasoning." },
        { term: "Independent Variable", definition: "The factor in an experiment that is deliberately changed by the investigator." },
        { term: "Dependent Variable", definition: "The factor being measured or observed that changes in response to the independent variable." },
        { term: "Control Group", definition: "The standard of comparison in an experiment, kept in a natural or unmanipulated state." }
      ];
    }
  };

  if (loading || !task) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-[#07070c] relative z-10 min-h-screen">
        <span className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-500 mt-3 font-bold uppercase tracking-wider animate-pulse">Initializing Workspace...</span>
      </div>
    );
  }

  const isQuiz = task.assignment_type === 'quiz';
  const studyCards = getFlashcards(task.chapter_title);

  return (
    <div className="flex-grow flex flex-col bg-[#07070c] relative z-10 p-4 md:p-6 min-h-screen text-slate-100 overflow-x-hidden">
      <div className="grid-overlay" />
      <div className="ambient-light" />

      {/* Modern Glass Top Header */}
      <header className="flex flex-col gap-3 mb-4 border-b border-slate-900 pb-4 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student/tasks')}
              className="text-slate-400 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-900 hover:border-slate-800 transition-all"
            >
              <ArrowLeft size={13} />
              <span>Exit Workspace</span>
            </button>
            <div className="h-4 w-px bg-slate-900 hidden sm:block" />
            <div>
              <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest bg-violet-600/10 px-2.5 py-0.5 rounded-md border border-violet-500/20">
                {task.chapter_title}
              </span>
              <h1 className="text-sm font-extrabold text-slate-200 mt-1 font-heading">
                {task.title}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(s => (
                <div 
                  key={s} 
                  className={`h-1.5 w-6 rounded-full transition-all ${
                    s === sessionStep ? 'bg-violet-500 shadow-md shadow-violet-500/50' : s < sessionStep ? 'bg-violet-850/40' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View Toggles (lg:hidden) */}
        <div className="flex lg:hidden bg-slate-950 p-1 rounded-xl border border-slate-900 w-full max-w-sm mt-2 mx-auto">
          <button
            onClick={() => setMobileTab('visual')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              mobileTab === 'visual' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            Visual Space
          </button>
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              mobileTab === 'chat' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            Learning Chat
          </button>
          <button
            onClick={() => setMobileTab('practice')}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
              mobileTab === 'practice' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            Practice
          </button>
        </div>
      </header>

      {/* Main 3-Column Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-140px)] overflow-hidden">
        
        {/* ========================================================================= */}
        {/* COLUMN 1: VISUAL SPACE (Left Column)                                       */}
        {/* ========================================================================= */}
        <section className={`lg:col-span-4 flex flex-col h-full bg-slate-950/45 border border-slate-900/80 rounded-2xl p-4 backdrop-blur-md overflow-hidden ${
          mobileTab === 'visual' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Header tabs selector */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <Compass className="text-cyan-400 animate-pulse" size={15} />
              <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider font-heading">Visual Space</h3>
            </div>

            <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-900">
              <button 
                onClick={() => setVisualTab('storyboard')}
                className={`p-1.5 rounded-md transition-colors ${visualTab === 'storyboard' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300'}`} 
                title="Storyboard (Concept Explainer)"
              >
                <Film size={13} />
              </button>
              <button 
                onClick={() => setVisualTab('playground')}
                className={`p-1.5 rounded-md transition-colors ${visualTab === 'playground' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300'}`} 
                title="Playground (Interactive Lab)"
              >
                <Sliders size={13} />
              </button>
              <button 
                onClick={() => setVisualTab('universe')}
                className={`p-1.5 rounded-md transition-colors ${visualTab === 'universe' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300'}`} 
                title="Universe (3D Model Explorable)"
              >
                <Layers size={13} />
              </button>
            </div>
          </div>

          {/* Active View Container */}
          <div className="flex-1 flex flex-col justify-center overflow-y-auto">
            {visualTab === 'storyboard' && (
              <div className="flex-1 flex flex-col gap-3 animate-fade-in h-full justify-between">
                <div className="flex-shrink-0 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest bg-violet-600/10 px-2.5 py-1 rounded-md border border-violet-500/20">
                    Concept Storyboard Video
                  </span>
                  <span className="text-[10px] text-slate-550 font-semibold font-mono">1:45 mins</span>
                </div>
                <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden border border-slate-900 p-1 shadow-inner h-full flex flex-col">
                  <VideoPlayer url={null} title={`${task.chapter_title} - Video Tutorial`} />
                </div>
              </div>
            )}

            {visualTab === 'playground' && (
              <div className="flex-1 flex flex-col gap-3 animate-fade-in h-full justify-between">
                <div className="flex-shrink-0 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-600/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                    Active Ohm's Law Simulation
                  </span>
                  <span className="text-[10px] text-slate-550 font-semibold font-mono">Real-time Lab</span>
                </div>
                <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden border border-slate-900 p-1 shadow-inner h-full flex flex-col">
                  <SimulationPlayer title={task.chapter_title} />
                </div>
              </div>
            )}

            {visualTab === 'universe' && (
              <div className="flex-1 flex flex-col gap-3 animate-fade-in h-full justify-between">
                <div className="flex-shrink-0 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest bg-rose-600/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                    Macro Universe Model
                  </span>
                  <span className="text-[10px] text-slate-550 font-semibold font-mono">3D Spin Viewer</span>
                </div>
                <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden border border-slate-900 p-1 shadow-inner h-full flex flex-col">
                  <AtomVisualizer />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* COLUMN 2: LEARNING CHAT WORKSPACE (Center Column)                          */}
        {/* ========================================================================= */}
        <section className={`lg:col-span-4 flex flex-col h-full bg-slate-950/45 border border-slate-900/80 rounded-2xl p-4 backdrop-blur-md overflow-hidden ${
          mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider font-heading">Learning Chat Workspace</h3>
            </div>
            <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider bg-slate-900 px-2.5 py-1 border border-slate-800 rounded-md">
              {sessionStep === 1 ? 'Start setup' : sessionStep === 4 ? 'Analysis' : `Dialogue Exchange ${exchangeCount}`}
            </span>
          </div>

          {/* Dialogue Feed */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-[250px] mb-4">
            {dialogue.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex gap-3 max-w-[90%] ${
                  msg.sender === 'ai' ? 'self-start' : 'self-end flex-row-reverse'
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[11px] border flex-shrink-0 ${
                  msg.sender === 'ai' 
                    ? 'bg-slate-900 border-slate-800 text-violet-400 shadow-md' 
                    : 'bg-violet-650 border-violet-550 text-white'
                }`}>
                  {msg.sender === 'ai' ? 'AI' : 'U'}
                </div>

                <div 
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed font-semibold transition-all ${
                    msg.sender === 'ai' 
                      ? 'bg-slate-900/60 text-slate-350 border border-slate-850 rounded-tl-none' 
                      : 'bg-violet-600/90 text-white rounded-tr-none shadow-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {aiTyping && (
              <div className="flex gap-3 self-start">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-violet-400 font-bold text-[11px] animate-pulse">
                  AI
                </div>
                <div className="bg-slate-900/60 text-slate-300 border border-slate-850 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Interactive User Input Controls */}
          <div className="flex-shrink-0 border-t border-slate-900 pt-3">
            {sessionStep === 1 && (
              <div className="flex flex-col gap-3 p-4 bg-violet-600/5 border border-violet-500/10 rounded-xl text-center">
                <p className="text-slate-400 text-xs leading-normal">
                  Familiarize yourself with the concept materials on the left or flashcards on the right before launching the conversation.
                </p>
                <button
                  onClick={handleStartActivity}
                  className="btn-primary py-2.5 text-xs font-bold"
                >
                  Start Concept Discussion
                </button>
              </div>
            )}

            {sessionStep === 4 && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
                <p className="text-emerald-400 text-xs font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 size={14} />
                  <span>Interactive Session Grading Complete!</span>
                </p>
                <span className="text-[10px] text-slate-550 font-semibold block mt-1">Review scorecard metrics on the right.</span>
              </div>
            )}

            {(sessionStep === 2 || sessionStep === 3) && (
              <div className="flex flex-col gap-3">
                {/* Voice Input Widget */}
                {!isQuiz && (
                  <VoiceRecorder 
                    onRecordingComplete={handleVoiceTranscribed}
                    placeholderText="Press microphone and speak your explanation..."
                  />
                )}

                {/* Text Input Backup */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={isQuiz ? "Quiz mode active. Answer on right..." : "Or type explanation response here..."}
                    disabled={isQuiz || sessionStep === 3}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendText();
                    }}
                    className="form-input flex-1 bg-slate-950 text-xs border border-slate-900 rounded-xl"
                  />
                  <button
                    onClick={handleSendText}
                    disabled={isQuiz || !textInput.trim() || sessionStep === 3}
                    className="btn-primary p-2.5 rounded-xl flex items-center justify-center w-11 h-11 flex-shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* COLUMN 3: PRACTICE SPACE (Right Column)                                    */}
        {/* ========================================================================= */}
        <section className={`lg:col-span-4 flex flex-col h-full bg-slate-950/45 border border-slate-900/80 rounded-2xl p-4 backdrop-blur-md overflow-hidden ${
          mobileTab === 'practice' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Header tabs selector (shows unless results step is active) */}
          {sessionStep !== 4 ? (
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <Award className="text-violet-400 animate-pulse" size={15} />
                <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider font-heading">Practice Space</h3>
              </div>

              <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-900">
                <button 
                  onClick={() => setPracticeTab('prove_it')}
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-md transition-all ${
                    practiceTab === 'prove_it' ? 'bg-violet-650 text-white' : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  Prove It
                </button>
                <button 
                  onClick={() => setPracticeTab('challenge')}
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-md transition-all ${
                    practiceTab === 'challenge' ? 'bg-violet-650 text-white' : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  Challenge
                </button>
                <button 
                  onClick={() => setPracticeTab('flashcards')}
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-md transition-all ${
                    practiceTab === 'flashcards' ? 'bg-violet-650 text-white' : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  Flashcards
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-3 mb-4 flex-shrink-0">
              <Award className="text-emerald-400" size={15} />
              <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider font-heading">Performance Scorecard</h3>
            </div>
          )}

          {/* Active Tab Panel Body */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col justify-between">
            {sessionStep === 4 ? (
              /* FINAL COMPLETED SCORECARD OVERLAY */
              <div className="flex-1 flex flex-col gap-5 justify-between h-full animate-fade-in">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 animate-bounce">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-250 text-sm leading-snug">Assessment Compiled</h4>
                      <span className="text-[10px] text-slate-550 font-semibold uppercase tracking-wider">Mootion Grader v2.0</span>
                    </div>
                  </div>

                  {/* Dynamic Scorebars */}
                  <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-450 uppercase tracking-wider text-[10px]">Concept Understanding</span>
                        <span className="text-violet-400 font-bold font-mono">{getScoreLabel(scores.u)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i} 
                            className={`h-2.5 flex-1 rounded-full ${
                              i <= scores.u ? 'bg-violet-500' : 'bg-slate-900'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-450 uppercase tracking-wider text-[10px]">
                          {isQuiz ? 'Expression' : 'Scientific Reasoning'}
                        </span>
                        <span className="text-cyan-400 font-bold font-mono">
                          {getScoreLabel(isQuiz ? scores.e : scores.r)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i} 
                            className={`h-2.5 flex-1 rounded-full ${
                              i <= (isQuiz ? scores.e : scores.r) ? 'bg-cyan-500' : 'bg-slate-900'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Feedback Commentary */}
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      AI Educator Feedback
                    </span>
                    <p className="text-xs text-slate-350 leading-relaxed font-semibold italic">
                      "{aiObservation}"
                    </p>
                  </div>
                </div>

                {/* Scorecard actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-900">
                  <button
                    onClick={handleTryAgain}
                    className="btn-secondary flex-1 py-2.5 text-xs font-bold"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleDone}
                    className="btn-primary flex-1 py-2.5 text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* STANDARD INTERACTIVE MODES */
              <>
                {practiceTab === 'prove_it' && (
                  <div className="flex-1 flex flex-col gap-4 animate-fade-in justify-between h-full">
                    {isQuiz ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center bg-slate-950 p-3.5 border border-slate-900 rounded-xl">
                          <div>
                            <span className="text-[9px] text-slate-550 font-bold uppercase tracking-wider">Active Quiz</span>
                            <h4 className="text-slate-300 font-bold text-xs mt-0.5">
                              Question {currentQuizIndex + 1} of {quizQuestions.length}
                            </h4>
                          </div>
                          <span className="text-xs text-violet-400 font-bold font-mono">
                            Score: {quizScore}/{quizQuestions.length}
                          </span>
                        </div>

                        <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
                          <h3 className="text-xs font-extrabold text-slate-300 leading-relaxed font-heading">
                            {quizQuestions[currentQuizIndex].question}
                          </h3>
                        </div>

                        <div className="flex flex-col gap-2.5">
                          {quizQuestions[currentQuizIndex].options.map((opt, idx) => {
                            const isSelected = selectedOption === idx;
                            const isCorrect = idx === quizQuestions[currentQuizIndex].correctAnswer;
                            
                            let btnStyle = 'border-slate-900 bg-slate-950/20 text-slate-455 hover:border-slate-800';
                            if (isSelected) {
                              btnStyle = 'border-violet-500 bg-violet-600/10 text-violet-200';
                            }
                            if (quizSubmitted) {
                              if (isCorrect) {
                                btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
                              } else if (isSelected) {
                                btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-300';
                              } else {
                                btnStyle = 'border-slate-900 bg-slate-950/10 text-slate-600 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={idx}
                                disabled={quizSubmitted}
                                onClick={() => setSelectedOption(idx)}
                                className={`py-3 px-4 border rounded-xl text-xs font-semibold text-left transition-all flex justify-between items-center ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && <Check size={14} className="text-emerald-400" />}
                                {quizSubmitted && isSelected && !isCorrect && <X size={14} className="text-rose-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-slate-950/60 border border-slate-900 rounded-xl">
                        <BookOpen size={32} className="text-slate-700 mb-2" />
                        <h4 className="font-bold text-slate-400 text-xs">No Quiz Assigned</h4>
                        <p className="text-slate-500 text-[10px] mt-1 leading-normal max-w-[200px]">
                          This is a discussion task. Use 'Challenge' to speak or review definitions via 'Flashcards'.
                        </p>
                      </div>
                    )}

                    {isQuiz && (
                      <div className="flex justify-end pt-4 border-t border-slate-900 mt-4">
                        {!quizSubmitted ? (
                          <button
                            onClick={handleQuizSubmit}
                            disabled={selectedOption === null}
                            className="btn-primary py-2 px-6 text-xs font-bold"
                          >
                            Submit Answer
                          </button>
                        ) : (
                          <button
                            onClick={handleQuizNext}
                            className="btn-primary py-2 px-6 text-xs font-bold flex items-center gap-1"
                          >
                            <span>
                              {currentQuizIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish & Grade'}
                            </span>
                            <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {practiceTab === 'challenge' && (
                  <div className="flex-1 flex flex-col gap-4 animate-fade-in justify-between h-full">
                    <div className="flex flex-col gap-3">
                      <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl">
                        <span className="text-[8px] font-bold text-violet-400 uppercase tracking-widest block mb-1">
                          Objective Instructions
                        </span>
                        <p className="text-slate-350 text-xs leading-relaxed font-semibold">
                          {task.instructions || "Analyze the topic carefully. Explain the key scientific relationships in details to the AI."}
                        </p>
                      </div>

                      {/* Helpful topic guidelines depending on assignment type */}
                      <div className="p-4 bg-slate-950/30 border border-slate-900 rounded-xl flex flex-col gap-2.5">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                          Active Cues & Concepts
                        </span>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                            <span className="text-slate-400 font-semibold">Mention charge carriers (electrons)</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                            <span className="text-slate-400 font-semibold">Mention pressure drivers (voltage)</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span className="text-slate-400 font-semibold">State opposing variables (resistance)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-violet-650/10 border border-violet-550/15 text-violet-350 rounded-xl text-[10px] leading-relaxed flex items-center gap-2 font-semibold">
                      <Info size={14} className="text-violet-400 flex-shrink-0" />
                      <span>Converse via speech/text in the central chat channel to hit these targets.</span>
                    </div>
                  </div>
                )}

                {practiceTab === 'flashcards' && (
                  <div className="flex-1 flex flex-col gap-3 animate-fade-in">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                      Interactive Flip Cards (Reference)
                    </span>
                    
                    <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                      {studyCards.map((c, idx) => {
                        const isFlipped = !!flippedCards[idx];
                        return (
                          <div
                            key={idx}
                            onClick={() => setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            className="cursor-pointer min-h-[90px] rounded-xl border border-slate-900 p-3.5 bg-slate-950 hover:border-slate-800 transition-all flex flex-col justify-center relative overflow-hidden"
                          >
                            {isFlipped ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-[7.5px] font-bold text-cyan-400 uppercase tracking-widest">
                                  Explanation / Definition
                                </span>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                                  {c.definition}
                                </p>
                                <span className="text-[8px] text-slate-500 font-bold mt-1 text-right block">
                                  Click to Flip
                                </span>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[7.5px] font-bold text-violet-400 uppercase tracking-widest">
                                    Scientific Principle
                                  </span>
                                  <h4 className="font-bold text-slate-200 text-xs font-heading">
                                    {c.term}
                                  </h4>
                                </div>
                                <div className="w-7 h-7 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                  <Layers size={13} />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
