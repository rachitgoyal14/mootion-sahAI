import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Sparkles, ShieldAlert, ArrowRight, ArrowLeft, GraduationCap, School } from 'lucide-react';
import { api } from '../../api';
import { Role } from '../../types';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Splash animation timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!loginId || !password || (isRegistering && !fullName)) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        // Register new user
        await api.register({
          login_id: loginId,
          full_name: fullName,
          role: selectedRole,
          password,
          preferred_language: 'english'
        });
        
        // Fetch profile
        const user = await api.getCurrentUser();
        onLoginSuccess(user);
        
        navigate(selectedRole === 'teacher' ? '/teacher/onboarding' : '/student/onboarding');
      } else {
        // Login existing user
        await api.login({ login_id: loginId, password });
        const user = await api.getCurrentUser();
        onLoginSuccess(user);

        if (!user.onboarding_completed) {
          navigate(user.role === 'teacher' ? '/teacher/onboarding' : '/student/onboarding');
        } else {
          navigate(user.role === 'teacher' ? '/teacher/home' : '/student/home');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError('');
    try {
      const authorizationUrl = await api.getGoogleStartUrl(selectedRole);
      window.location.href = authorizationUrl;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start Google Sign-In.');
      setLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#07070c] relative overflow-hidden z-10">
        <div className="grid-overlay" />
        <div className="ambient-light" />
        
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
          <div className="absolute w-16 h-16 rounded-full border-4 border-cyan-500/20 border-b-cyan-500 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
          <div className="absolute text-violet-400 font-bold text-3xl tracking-widest font-heading">
            M
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-400 to-accent animate-pulse font-heading">
          mootion
        </h1>
        <p className="text-slate-500 text-sm mt-2 font-medium tracking-wide">
          Generative Science Learning Ecosystem
        </p>
      </div>
    );
  }

  // --- STEP 1: CHOOSE YOUR ROLE ---
  if (!selectedRole) {
    return (
      <div className="flex-1 min-h-screen flex flex-col items-center justify-center p-6 bg-[#07070c] relative overflow-hidden z-10">
        <div className="grid-overlay" />
        <div className="ambient-light" />
        <div className="ambient-light-bottom" />

        <div className="text-center mb-12 max-w-lg z-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight font-heading mb-4">
            Choose your role
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Welcome to Mootion. Select your workspace below to get started exploring interactive roadmaps and activities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full z-10 px-4">
          {/* Student Card */}
          <div 
            onClick={() => setSelectedRole('student')}
            className="glass-panel p-8 flex flex-col justify-between h-[300px] cursor-pointer border border-slate-800 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-600/5 hover:-translate-y-1 transform transition-all group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-650/10 border border-cyan-550/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-100 font-heading mb-3">
                Student
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Explore science and math concepts through interactive models, visual spaces, and quests.
              </p>
            </div>
            
            <button className="flex items-center justify-between py-3 px-6 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-300 w-fit gap-2 transition-all">
              <span>Join Class</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Teacher Card */}
          <div 
            onClick={() => setSelectedRole('teacher')}
            className="glass-panel p-8 flex flex-col justify-between h-[300px] cursor-pointer border border-slate-800 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-650/5 hover:-translate-y-1 transform transition-all group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <School size={24} />
              </div>
              <h2 className="text-3xl font-bold text-slate-100 font-heading mb-3">
                Teacher
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Build custom roadmaps, assign gamified voice tasks, and monitor class completion progress.
              </p>
            </div>
            
            <button className="flex items-center justify-between py-3 px-6 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-violet-300 w-fit gap-2 transition-all">
              <span>Create Roadmap</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 2: CREDENTIALS PAGE ---
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#07070c] relative z-10 min-h-screen">
      <div className="grid-overlay" />
      <div className="ambient-light" />
      <div className="ambient-light-bottom" />

      <div className="w-full max-w-md glass-panel p-8 flex flex-col relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-xl pointer-events-none ${
          selectedRole === 'teacher' ? 'bg-violet-600/10' : 'bg-cyan-600/10'
        }`} />
        
        {/* Back navigation */}
        <button
          onClick={() => {
            setSelectedRole(null);
            setIsRegistering(false);
            setError('');
          }}
          className="text-slate-400 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 self-start mb-6 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to Roles</span>
        </button>

        <div className="text-center mb-8">
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-3 inline-block ${
            selectedRole === 'teacher' 
              ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' 
              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
          }`}>
            {selectedRole} account
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-350 font-heading">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-400 text-xs mt-2">
            {isRegistering 
              ? `Register as a ${selectedRole} to begin` 
              : `Enter credentials to access your ${selectedRole} panel`}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 animate-shake">
            <ShieldAlert size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Full Name on Register */}
          {isRegistering && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Asha Mehta"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

          {/* Username / ID */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {selectedRole === 'teacher' ? 'Teacher Email / ID' : 'Student Email / ID'}
            </label>
            <input
              type="text"
              placeholder={selectedRole === 'teacher' ? 'e.g. teacher@mootion.org' : 'e.g. student@mootion.org'}
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                <span>{isRegistering ? 'Register & Onboard' : 'Log In'}</span>
              </>
            )}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs font-bold uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-3 py-3 border border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-900/50 text-white font-bold text-sm rounded-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.359 0 3.386 2.682 1.445 6.614l3.82 3.151z"
              />
              <path
                fill="#4285F4"
                d="M16.04 15.35c-1.127.764-2.545 1.196-4.04 1.196-2.909 0-5.382-1.964-6.264-4.605L1.918 15.11C3.859 19.04 7.832 21.723 12 21.723c3.082 0 5.89-.99 8.018-2.845l-3.977-3.528z"
              />
              <path
                fill="#34A853"
                d="M23.52 12.277c0-.791-.073-1.55-.205-2.277H12v4.51h6.477c-.277 1.482-1.114 2.736-2.373 3.582l3.977 3.528c2.327-2.146 3.436-5.3 3.436-9.343z"
              />
              <path
                fill="#FBBC05"
                d="M5.736 12A7.126 7.126 0 0 1 5.736 9.77L1.918 6.618A12.015 12.015 0 0 0 0 12c0 1.9.445 3.705 1.236 5.318l4.49-3.318z"
              />
            </svg>
            <span>{isRegistering ? 'Sign up with Google' : 'Sign in with Google'}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-slate-400 hover:text-white text-xs font-semibold inline-flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors"
          >
            {isRegistering ? (
              <>
                <span>Already have an account?</span>
                <span className="text-violet-400 underline">Log in here</span>
              </>
            ) : (
              <>
                <span>New to Mootion?</span>
                <span className="text-violet-400 underline flex items-center gap-0.5">
                  <UserPlus size={13} /> Set up your account
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
