import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { api } from '../../api';
import { User } from '../../types';

interface OAuthCallbackProps {
  onLoginSuccess: (user: User) => void;
}

export const OAuthCallback: React.FC<OAuthCallbackProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Exchanging Google credentials...');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      setError('Missing authentication code or state from Google.');
      return;
    }

    async function processCallback() {
      try {
        setStatus('Authenticating with backend server...');
        // 1. Exchange callback parameters for access token
        await api.handleGoogleCallback(code!, state!);

        setStatus('Loading your user profile...');
        // 2. Fetch the current logged-in user profile details
        const user = await api.getCurrentUser();

        setStatus('Redirecting to dashboard...');
        // 3. Inform parent component of success
        onLoginSuccess(user);

        // 4. Redirect based on role and onboarding status
        if (!user.onboarding_completed) {
          navigate(user.role === 'teacher' ? '/teacher/onboarding' : '/student/onboarding', { replace: true });
        } else {
          navigate(user.role === 'teacher' ? '/teacher/home' : '/student/home', { replace: true });
        }
      } catch (err: any) {
        console.error('OAuth Callback Error:', err);
        setError(err.message || 'Failed to complete Google authentication.');
      }
    }

    processCallback();
  }, [searchParams, navigate, onLoginSuccess]);

  return (
    <div className="flex-1 min-h-screen flex flex-col items-center justify-center bg-[#07070c] relative overflow-hidden z-10 px-6">
      <div className="grid-overlay" />
      <div className="ambient-light" />
      <div className="ambient-light-bottom" />

      <div className="w-full max-w-md glass-panel p-8 flex flex-col items-center relative overflow-hidden text-center">
        {/* Decorative top blur */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-xl pointer-events-none" />

        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400 font-heading mb-3">
              Authentication Failed
            </h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="btn-primary w-full py-3"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            {/* Pulsing visual spinner */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
              <div className="absolute w-12 h-12 rounded-full border-4 border-cyan-500/20 border-b-cyan-500 animate-spin [animation-direction:reverse] [animation-duration:1.2s]" />
            </div>
            
            <h2 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 font-heading mb-3">
              Completing Sign-In
            </h2>
            <p className="text-slate-400 text-sm font-medium animate-pulse max-w-xs leading-relaxed">
              {status}
            </p>
            <p className="text-slate-500 text-xs mt-6">
              Please do not close this window or navigate away.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
