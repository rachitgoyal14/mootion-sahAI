import React, { useState, useEffect, useRef } from 'react';
import { Sliders, RefreshCw, Info } from 'lucide-react';

interface SimulationPlayerProps {
  title?: string;
  url?: string;
  onVariablesChange?: (variables: { voltage: number; resistance: number }) => void;
}

export const SimulationPlayer: React.FC<SimulationPlayerProps> = ({ 
  title = "Ohm's Law Interactive Lab", 
  url,
  onVariablesChange 
}) => {
  const [voltage, setVoltage] = useState(4.5); // 0V to 9V

  const [resistance, setResistance] = useState(25); // 5 to 50 ohms
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const current = (voltage / resistance).toFixed(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Drawing variables
    const width = canvas.width;
    const height = canvas.height;
    
    // Draw circuit
    ctx.clearRect(0, 0, width, height);

    // Dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 25) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let j = 0; j < height; j += 25) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(width, j);
      ctx.stroke();
    }

    // Draw battery (left)
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(40, 80, 50, 80);
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${voltage.toFixed(1)} V`, 48, 125);
    ctx.fillText('Battery', 45, 105);

    // Draw resistor (right)
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(330, 80);
    ctx.lineTo(330, 100);
    // Zigzag lines for resistor
    ctx.lineTo(320, 105);
    ctx.lineTo(340, 115);
    ctx.lineTo(320, 125);
    ctx.lineTo(340, 135);
    ctx.lineTo(320, 145);
    ctx.lineTo(330, 150);
    ctx.lineTo(330, 160);
    ctx.stroke();
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(`${resistance} Ω`, 355, 125);

    // Draw complete wire loops
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(90, 120);
    ctx.lineTo(330, 120);
    ctx.moveTo(330, 120);
    // Note: connecting path
    ctx.moveTo(330, 160);
    ctx.lineTo(330, 200);
    ctx.lineTo(65, 200);
    ctx.lineTo(65, 160);
    ctx.stroke();

    // Draw current gauge ammeter (bottom)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(200, 200, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#06b6d4';
    ctx.font = '10px monospace';
    ctx.fillText(`${current}A`, 182, 204);

    // Draw glowing particles inside wire (speed proportional to current)
    const particleCount = 8;
    const speed = parseFloat(current) * 15;
    const time = Date.now() * 0.001 * speed;
    
    // Wire loop boundaries: 90 -> 330 (top), 330 -> 330 (resistor), 330 -> 65 (bottom), 65 -> 65 (left connect)
    // Map relative pos 0..1 to wire path
    const getWirePt = (t: number) => {
      // Loop length: 240 top + 80 right + 265 bottom + 80 left = 665
      const totalLen = 665;
      const dist = (t * totalLen) % totalLen;
      if (dist < 240) {
        return { x: 90 + dist, y: 120 };
      } else if (dist < 320) {
        return { x: 330, y: 120 + (dist - 240) };
      } else if (dist < 585) {
        return { x: 330 - (dist - 320), y: 200 };
      } else {
        return { x: 65, y: 200 - (dist - 585) };
      }
    };

    ctx.fillStyle = '#ccff00';
    for (let i = 0; i < particleCount; i++) {
      const pt = getWirePt((time / 10 + i / particleCount) % 1);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (onVariablesChange) {
      onVariablesChange({ voltage, resistance });
    }
  }, [voltage, resistance, current]);

  const handleReset = () => {
    setVoltage(4.5);
    setResistance(25);
  };

  if (url) {
    return (
      <div className="w-full h-full min-h-[350px] border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-2xl relative">
        <iframe
          src={url}
          title={title}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          xr-spatial-tracking="true"
          execution-while-out-of-viewport="true"
          execution-while-not-rendered="true"
          web-share="true"
          className="w-full h-full border-0 absolute top-0 left-0"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-5 border border-slate-800 rounded-xl bg-slate-900/40 backdrop-blur-md shadow-2xl">
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-lg border border-slate-800">
          <h4 className="text-sm font-semibold tracking-tight text-slate-200 flex items-center gap-1.5">
            <Info size={16} className="text-cyan-400" />
            {title}
          </h4>
          <button 
            onClick={handleReset}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <canvas 
          ref={canvasRef} 
          width={400} 
          height={260} 
          className="w-full bg-slate-950 border border-slate-800 rounded-lg shadow-inner object-cover"
        />
      </div>

      <div className="w-full md:w-72 flex flex-col justify-center gap-6 bg-slate-950/60 p-5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Sliders size={18} className="text-violet-400" />
          <h3 className="font-semibold text-slate-200">Variables</h3>
        </div>

        {/* Voltage Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Voltage (V)</span>
            <span className="text-violet-400 font-mono">{voltage.toFixed(1)} V</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="9" 
            step="0.5" 
            value={voltage} 
            onChange={(e) => setVoltage(parseFloat(e.target.value))}
            className="w-full accent-violet-500 cursor-pointer bg-slate-800 rounded-lg h-2"
          />
        </div>

        {/* Resistance Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>Resistance (R)</span>
            <span className="text-rose-400 font-mono">{resistance} Ω</span>
          </div>
          <input 
            type="range" 
            min="5" 
            max="50" 
            step="1" 
            value={resistance} 
            onChange={(e) => setResistance(parseInt(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer bg-slate-800 rounded-lg h-2"
          />
        </div>

        {/* Live Calculation display */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col gap-1 text-center shadow-md">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
            Current (I = V/R)
          </span>
          <span className="text-2xl font-bold text-cyan-400 font-mono">
            {current} A
          </span>
        </div>
      </div>
    </div>
  );
};
