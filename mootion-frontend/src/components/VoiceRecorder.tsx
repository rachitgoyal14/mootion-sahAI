import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (text: string) => void;
  placeholderText?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete, 
  placeholderText = "Tap mic to start speaking..." 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setTimer(0);
    intervalRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Simulate speech-to-text transcription results after recording
    const sampleResponses = [
      "I think electric current is the flow of electrons through a wire. When the circuit is closed, the battery pushes them.",
      "The resistor slows down the flow of charge, which increases resistance. According to Ohm's law, voltage equals current times resistance.",
      "A complete loop is required. Electrons start from the negative terminal of the battery, go through the bulb, and return to the positive terminal.",
      "I predict that bulb A will remain bright but bulb B will go out if we cut the parallel wire because they are on different paths."
    ];
    const transcribed = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
    onRecordingComplete(transcribed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border border-slate-800 rounded-xl bg-slate-950/60 backdrop-blur-sm">
      {isRecording ? (
        <div className="w-full flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-2 text-rose-500 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>Recording ({formatTime(timer)})</span>
          </div>
          
          {/* Animated Waveform */}
          <div className="waveform-container my-2">
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
          </div>

          <button
            onClick={stopRecording}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-rose-600/30"
          >
            <Square size={22} fill="white" />
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-4">
          <p className="text-slate-400 text-sm text-center font-medium">{placeholderText}</p>
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-violet-600/30"
          >
            <Mic size={28} />
          </button>
        </div>
      )}
    </div>
  );
};
