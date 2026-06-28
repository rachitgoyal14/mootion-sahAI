import React from 'react';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    const role = localStorage.getItem('mootion_role');
    const token = localStorage.getItem(`mootion_${role}_access_token`);

    if (token && role === 'teacher') {
      navigate('/teacher/home');
    } else if (token && role === 'student') {
      navigate('/student/home');
    } else {
      navigate('/teacher/login');
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-[#f6f4ee] font-montserrat text-[#1800ad] flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Mootion logo wordmark */}
      <div className="mb-8 cursor-pointer animate-fade-in" onClick={handleGoHome}>
        <span className="font-val text-[#1800ad] text-[42px] leading-none tracking-widest">Mootion</span>
      </div>

      <div className="flex flex-col items-center gap-4 max-w-md">
        <h1 className="text-8xl md:text-9xl font-black tracking-tight leading-none text-[#1800ad] animate-pulse">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#1800ad] mt-2">
          Oops! This page doesn't exist.
        </h2>
        <p className="text-[#1800ad]/70 font-bold text-xs sm:text-sm leading-relaxed max-w-[90%] lowercase">
          It may have moved or you may have followed a broken link.
        </p>
        <button
          onClick={handleGoHome}
          className="w-full sm:w-auto px-10 py-3.5 mt-6 bg-[#1800ad] border-2 border-[#1800ad] hover:bg-[#f6f4ee] text-[#f6f4ee] hover:text-[#1800ad] text-sm md:text-base font-bold transition-all duration-300 rounded-full shadow-md hover:scale-102 cursor-pointer"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

// Next.js convention default export
export default NotFoundPage;
