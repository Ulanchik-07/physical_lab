import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

interface SHMState {
  position: number;
  velocity: number;
  acceleration: number;
  time: number;
}

export default function SimpleHarmonicMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Controls
  const [amplitude, setAmplitude] = useState(50);
  const [frequency, setFrequency] = useState(1);
  const [phase, setPhase] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Input fields
  const [inputAmplitude, setInputAmplitude] = useState("50");
  const [inputFrequency, setInputFrequency] = useState("1");
  const [inputPhase, setInputPhase] = useState("0");

  const handleCalculate = () => {
    const a = parseFloat(inputAmplitude) || 50;
    const f = parseFloat(inputFrequency) || 1;
    const p = parseFloat(inputPhase) || 0;
    
    setAmplitude(Math.min(100, Math.max(10, a)));
    setFrequency(Math.min(3, Math.max(0.5, f)));
    setPhase(Math.min(2 * Math.PI, Math.max(0, p)));
    setIsRunning(false);
    stateRef.current = { position: 50, velocity: 0, acceleration: 0, time: 0 };
  };

  // Simulation state
  const stateRef = useRef<SHMState>({
    position: 50,
    velocity: 0,
    acceleration: 0,
    time: 0,
  });

  const period = 1 / frequency;
  const angularFrequency = 2 * Math.PI * frequency;
  const maxVelocity = amplitude * angularFrequency;
  const maxAcceleration = amplitude * angularFrequency * angularFrequency;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      if (isRunning) {
        const dt = 0.016;
        stateRef.current.time += dt;

        const omega = 2 * Math.PI * frequency;
        const t = stateRef.current.time;

        // x(t) = A sin(ωt + φ)
        stateRef.current.position = amplitude * Math.sin(omega * t + phase);

        // v(t) = Aω cos(ωt + φ)
        stateRef.current.velocity = amplitude * omega * Math.cos(omega * t + phase);

        // a(t) = -Aω² sin(ωt + φ)
        stateRef.current.acceleration = -amplitude * omega * omega * Math.sin(omega * t + phase);
      }

      // Drawing
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = "rgba(0, 217, 255, 0.05)";
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      // Draw equilibrium position
      ctx.strokeStyle = "rgba(0, 217, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 0);
      ctx.lineTo(50, height);
      ctx.stroke();

      // Draw motion range
      ctx.strokeStyle = "rgba(100, 150, 255, 0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50 - amplitude, 0);
      ctx.lineTo(50 - amplitude, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(50 + amplitude, 0);
      ctx.lineTo(50 + amplitude, height);
      ctx.stroke();

      // Draw graph (position vs time)
      const scale = 30;
      ctx.strokeStyle = "rgba(100, 150, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < width; i += 2) {
        const time = (i - 100) / scale;
        const omega = 2 * Math.PI * frequency;
        const pos = amplitude * Math.sin(omega * time + phase);
        const y = centerY - pos;

        if (i === 0) {
          ctx.moveTo(i, y);
        } else {
          ctx.lineTo(i, y);
        }
      }
      ctx.stroke();

      // Draw current position
      const state = stateRef.current;
      const screenX = 50 + state.position;
      const screenY = centerY;

      // Mass
      ctx.fillStyle = "rgba(255, 181, 0, 0.9)";
      ctx.beginPath();
      ctx.arc(screenX, screenY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Velocity vector
      ctx.strokeStyle = "rgba(100, 200, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX, screenY - state.velocity * 2);
      ctx.stroke();

      // Info
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "12px Inter";
      ctx.fillText(`x(t) = ${state.position.toFixed(1)} units`, 20, 25);
      ctx.fillText(`v(t) = ${state.velocity.toFixed(2)} units/s`, 20, 45);
      ctx.fillText(`a(t) = ${state.acceleration.toFixed(2)} units/s²`, 20, 65);
      ctx.fillText(`T = ${period.toFixed(2)}s`, 20, 85);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [amplitude, frequency, phase, isRunning]);

  return (
    <SimulationLayout
      title="Простое гармоническое движение - Simple Harmonic Motion"
      canvas={
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full h-full max-w-2xl mx-auto"
        />
      }
      controls={
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Амплитуда
            </label>
            <input
              type="number"
              min="10"
              max="100"
              step="1"
              value={inputAmplitude}
              onChange={(e) => setInputAmplitude(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400 disabled:opacity-50"
              placeholder="Введите амплитуду"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Частота, Hz
            </label>
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              value={inputFrequency}
              onChange={(e) => setInputFrequency(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
              placeholder="Введите частоту"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Начальная фаза, рад
            </label>
            <input
              type="number"
              min="0"
              max={Math.PI * 2}
              step="0.1"
              value={inputPhase}
              onChange={(e) => setInputPhase(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
              placeholder="Введите фазу"
            />
          </div>

          <button
            onClick={handleCalculate}
            disabled={isRunning}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            Рассчитать
          </button>

          <div className="pt-4 space-y-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isRunning
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30"
                  : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30"
              }`}
            >
              {isRunning ? "Пауза" : "Старт"}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                stateRef.current = { position: 50, velocity: 0, acceleration: 0, time: 0 };
              }}
              className="w-full py-3 px-4 border border-slate-600 hover:border-cyan-400 rounded-lg transition-colors text-slate-300 hover:text-cyan-400 font-semibold"
            >
              Сброс
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neon-cyan mb-4">
            Простое гармоническое движение
          </h2>
          <p className="text-slate-300 mb-4">
            Движение, при котором объект колеблется вокруг положения равновесия с постоянной амплитудой
            и периодом. Примеры: маятник, масса на пружине, колебания атома.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Уравнение положения</p>
            <p className="text-slate-400 mt-1">x(t) = A sin(ωt + φ)</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Уравнение скорости</p>
            <p className="text-slate-400 mt-1">v(t) = Aω cos(ωt + φ)</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Уравнение ускорения</p>
            <p className="text-slate-400 mt-1">a(t) = -Aω² sin(ωt + φ)</p>
          </div>
        </div>

        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-neon-cyan mb-3">Значения</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Период:</span>
              <span className="text-neon-cyan font-mono">{period.toFixed(3)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Макс. скорость:</span>
              <span className="text-neon-cyan font-mono">{maxVelocity.toFixed(2)} шт./с</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Макс. ускорение:</span>
              <span className="text-neon-cyan font-mono">{maxAcceleration.toFixed(2)} шт./с²</span>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
