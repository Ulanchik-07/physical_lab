import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

export default function SoundWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Controls
  const [frequency, setFrequency] = useState(440); // Hz (A4 note)
  const [amplitude, setAmplitude] = useState(0.3); // 0-1
  const [isPlaying, setIsPlaying] = useState(false);

  // Input fields
  const [inputFrequency, setInputFrequency] = useState("440");
  const [inputAmplitude, setInputAmplitude] = useState("0.3");

  const handleCalculate = () => {
    const freq = parseFloat(inputFrequency) || 440;
    const amp = parseFloat(inputAmplitude) || 0.3;
    
    setFrequency(Math.min(2000, Math.max(20, freq)));
    setAmplitude(Math.min(1, Math.max(0, amp)));
  };

  // Get wavelength
  const speedOfSound = 343; // m/s at 20°C
  const wavelength = speedOfSound / frequency;

  // Initialize audio context safely
  const initAudio = () => {
    if (!audioContextRef.current) {
      try {
        const audioContext =
          new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = amplitude;
        gainRef.current = gainNode;
      } catch (e) {
        console.error("Web Audio API not supported:", e);
      }
    }
  };

  // Play sound
  const playSound = () => {
    initAudio();
    if (!audioContextRef.current || !gainRef.current) return;

    try {
      if (isPlaying) {
        // Stop current sound
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
          oscillatorRef.current = null;
        }
        setIsPlaying(false);
      } else {
        // Create and start oscillator
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = frequency;
        osc.connect(gainRef.current);
        osc.start();
        oscillatorRef.current = osc;
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  };

  // Update frequency when slider changes
  useEffect(() => {
    if (oscillatorRef.current && isPlaying) {
      oscillatorRef.current.frequency.value = frequency;
    }
  }, [frequency, isPlaying]);

  // Update amplitude/gain
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = amplitude;
    }
  }, [amplitude]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch (e) {
          // Already stopped
        }
      }
    };
  }, []);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationTime = 0;

    const animate = () => {
      animationTime += 0.016;

      // Clear canvas
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid background
      ctx.strokeStyle = "rgba(0, 217, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw title
      ctx.fillStyle = "#00d9ff";
      ctx.font = "bold 18px Inter";
      ctx.textAlign = "center";
      ctx.fillText("Sound Wave Visualization", canvas.width / 2, 40);

      // Draw waveform
      const waveStartY = 150;
      const waveHeight = 60;
      const waveLength = wavelength * 100; // Scale for visualization
      const phase = animationTime * frequency * Math.PI * 2;

      ctx.strokeStyle = "rgba(0, 217, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < canvas.width; x += 2) {
        const y =
          waveStartY +
          Math.sin((x / waveLength) * Math.PI * 2 + phase) *
            waveHeight *
            amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw frequency indicator circles (wave sources)
      const numSources = Math.min(Math.ceil(canvas.width / 80), 6);
      for (let i = 0; i < numSources; i++) {
        const x = (i + 1) * (canvas.width / (numSources + 1));
        const distance = Math.abs(x - (canvas.width / 2 + Math.sin(phase) * 50));
        const radius = (distance / 100 + animationTime * frequency * 20) % 80;
        const opacity = Math.max(0, 1 - radius / 80);

        ctx.strokeStyle = `rgba(0, 217, 255, ${opacity * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, waveStartY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw center source
      ctx.fillStyle = "rgba(255, 181, 0, 0.8)";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, waveStartY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw info panel
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(20, 250, 460, 130);
      ctx.strokeStyle = "rgba(0, 217, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 250, 460, 130);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "13px Inter";
      ctx.textAlign = "left";
      ctx.fillText(`Frequency (f): ${frequency.toFixed(1)} Hz`, 30, 275);
      ctx.fillText(`Wavelength (λ): ${wavelength.toFixed(3)} m`, 30, 298);
      ctx.fillText(
        `Period (T): ${(1 / frequency).toFixed(4)} s`,
        30,
        321
      );
      ctx.fillText(
        `Speed of Sound: ${speedOfSound} m/s`,
        30,
        344
      );
      ctx.fillStyle = "rgba(255, 181, 0, 0.9)";
      ctx.font = "bold 13px Inter";
      ctx.fillText(
        `v = f × λ → ${speedOfSound} = ${frequency.toFixed(1)} × ${wavelength.toFixed(3)}`,
        30,
        367
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [frequency, amplitude, wavelength]);

  return (
    <SimulationLayout
      title="Звуковые волны - Sound Waves"
      canvas={
        <canvas
          ref={canvasRef}
          width={500}
          height={420}
          className="w-full h-full max-w-2xl mx-auto"
        />
      }
      controls={
        <div className="space-y-6">
          {/* Frequency Control */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Частота, Hz
            </label>
            <input
              type="number"
              min="20"
              max="2000"
              step="1"
              value={inputFrequency}
              onChange={(e) => setInputFrequency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
              placeholder="Введите частоту"
            />
          </div>

          {/* Amplitude Control */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Громкость (0-1)
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={inputAmplitude}
              onChange={(e) => setInputAmplitude(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
              placeholder="Введите громкость"
            />
          </div>

          {/* Display Values */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-2">
            <div>
              <p className="text-sm text-slate-400">Wavelength</p>
              <p className="text-xl font-bold text-neon-cyan">
                {wavelength.toFixed(3)} m
              </p>
            </div>
            <div className="pt-2 border-t border-slate-600">
              <p className="text-xs text-slate-400">Period: {(1 / frequency).toFixed(4)} s</p>
              <p className="text-xs text-slate-400 mt-1">
                Formula: λ = v / f
              </p>
            </div>
          </div>

          {/* Play Button */}
          <div className="pt-4 space-y-3">
            <button
              onClick={handleCalculate}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Рассчитать
            </button>
            <button
              onClick={playSound}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isPlaying
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30"
                  : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30"
              }`}
            >
              {isPlaying ? "Стоп" : "Запуск"}
            </button>
          </div>

          {/* Quick Note Buttons */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-300">Musical Notes:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFrequency(440)}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
              >
                A4 (440 Hz)
              </button>
              <button
                onClick={() => setFrequency(880)}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
              >
                A5 (880 Hz)
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div>
        <h2 className="text-xl font-bold text-neon-cyan mb-4">About Sound Waves</h2>
        <p className="text-slate-300 mb-4">
          Sound is a mechanical wave that propagates through a medium. The
          frequency of a sound wave determines its pitch, while the amplitude
          determines its loudness.
        </p>
        <div className="grid grid-cols-1 gap-4 mt-4 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan mb-2">Wave Equation:</p>
            <p className="text-slate-400 font-mono">v = f × λ</p>
            <p className="text-slate-400 mt-2 text-xs">
              Velocity = Frequency × Wavelength
            </p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan mb-2">Key Properties:</p>
            <ul className="text-slate-400 text-xs space-y-1">
              <li>• Frequency range (human): 20 Hz - 20 kHz</li>
              <li>• Speed of sound in air: ~343 m/s</li>
              <li>• Higher frequency = Higher pitch</li>
            </ul>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
