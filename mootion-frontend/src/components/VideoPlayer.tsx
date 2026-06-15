import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Maximize2 } from 'lucide-react';

interface VideoPlayerProps {
  url?: string | null;
  title?: string;
  autoplay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title = "Concept Explanation", autoplay = false }) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Animate educational visualizer on canvas if no video url is given
  useEffect(() => {
    if (url) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let chargePos = 0;
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background dark slate
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw battery
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(50, 120, 60, 60);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('9V BAT', 55, 155);

      // Draw wire circuit path
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(110, 150);
      ctx.lineTo(350, 150);
      ctx.lineTo(350, 240);
      ctx.lineTo(80, 240);
      ctx.lineTo(80, 180);
      ctx.stroke();

      // Draw bulb
      ctx.fillStyle = isPlaying ? '#eab308' : '#334155';
      ctx.beginPath();
      ctx.arc(350, 200, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f1f5f9';
      ctx.stroke();
      
      if (isPlaying) {
        // Bulb glow effect
        const grad = ctx.createRadialGradient(350, 200, 10, 350, 200, 40);
        grad.addColorStop(0, 'rgba(234, 179, 8, 0.4)');
        grad.addColorStop(1, 'rgba(234, 179, 8, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(350, 200, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw drifting electrons
      if (isPlaying) {
        chargePos = (chargePos + 1.5) % 520;
      }
      
      // Wire segments mapping
      const getPosition = (pos: number) => {
        if (pos < 240) {
          return { x: 110 + pos, y: 150 };
        } else if (pos < 330) {
          return { x: 350, y: 150 + (pos - 240) };
        } else if (pos < 600) {
          return { x: 350 - (pos - 330), y: 240 };
        } else {
          return { x: 80, y: 240 - (pos - 600) };
        }
      };

      ctx.fillStyle = '#06b6d4';
      for (let i = 0; i < 8; i++) {
        const offsetPos = (chargePos + i * 65) % 520;
        const pt = getPosition(offsetPos);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Title overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(10, 10, canvas.width - 20, 40);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '14px Outfit';
      ctx.fillText(title, 20, 35);
      
      // Update progress if playing
      if (isPlaying) {
        setProgress(p => {
          if (p >= 100) return 0;
          return p + 0.05;
        });
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, url, title]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  return (
    <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-2xl flex flex-col w-full aspect-video">
      {url ? (
        <video 
          src={url} 
          className="w-full h-full object-cover flex-1"
          autoPlay={autoplay}
          controls
        />
      ) : (
        <canvas 
          ref={canvasRef} 
          width={500} 
          height={300} 
          className="w-full h-full flex-1 bg-slate-900 object-cover"
        />
      )}

      {/* Custom Video Control Overlay */}
      {!url && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 to-transparent p-4 flex flex-col gap-3">
          {/* Progress bar */}
          <div className="h-1 bg-slate-800 rounded-full cursor-pointer overflow-hidden relative">
            <div 
              className="h-full bg-violet-500 transition-all duration-100" 
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay}
                className="hover:text-white transition-all transform hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button 
                onClick={handleRestart}
                className="hover:text-white transition-all transform hover:scale-105"
              >
                <RotateCcw size={18} />
              </button>
              <div className="text-xs font-mono font-medium">
                {Math.floor((progress * 0.6) / 60)}:
                {String(Math.floor((progress * 0.6) % 60)).padStart(2, '0')} / 1:00
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="hover:text-white transition-all">
                <Volume2 size={20} />
              </button>
              <button className="hover:text-white transition-all">
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
