import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

interface PendulumState {
  angle: number;
  angularVelocity: number;
  angularAcceleration: number;
  time: number;
}

export default function Pendulum() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Controls
  const [length, setLength] = useState(200);
  const [angle, setAngle] = useState(45);
  const [damping, setDamping] = useState(0.99);
  const [isRunning, setIsRunning] = useState(false);
  const [gravity, setGravity] = useState(9.81);

  // Input fields
  const [inputLength, setInputLength] = useState("200");
  const [inputAngle, setInputAngle] = useState("45");
  const [inputGravity, setInputGravity] = useState("9.81");
  const [inputDamping, setInputDamping] = useState("0.99");

  const handleCalculate = () => {
    const l = parseFloat(inputLength) || 200;
    const a = parseFloat(inputAngle) || 45;
    const g = parseFloat(inputGravity) || 9.81;
    const d = parseFloat(inputDamping) || 0.99;
    
    setLength(Math.min(300, Math.max(50, l)));
    setAngle(Math.min(89, Math.max(0, a)));
    setGravity(Math.min(20, Math.max(1, g)));
    setDamping(Math.min(1, Math.max(0.95, d)));
    setIsRunning(false);
    stateRef.current = {
      angle: (Math.min(89, Math.max(0, a)) * (Math.PI / 180)),
      angularVelocity: 0,
      angularAcceleration: 0,
      time: 0,
    };
  };

  // Simulation state
  const stateRef = useRef<PendulumState>({
    angle: angle * (Math.PI / 180),
    angularVelocity: 0,
    angularAcceleration: 0,
    time: 0,
  });

  // Update angle when slider changes
  useEffect(() => {
    if (!isRunning) {
      stateRef.current.angle = angle * (Math.PI / 180);
      stateRef.current.angularVelocity = 0;
    }
  }, [angle, isRunning]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Physics simulation
      if (isRunning) {
        const dt = 0.016; // ~60 FPS
        const state = stateRef.current;

        // Angular acceleration: a = -(g/L) * sin(θ)
        state.angularAcceleration =
          -(gravity / length) * Math.sin(state.angle);

        // Update velocity and position
        state.angularVelocity += state.angularAcceleration * dt;
        state.angularVelocity *= damping; // Apply damping
        state.angle += state.angularVelocity * dt;

        state.time += dt;
      }

      // Drawing
      const state = stateRef.current;

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

      // Pivot point
      const pivotX = canvas.width / 2;
      const pivotY = canvas.height / 4;

      // Calculate bob position
      const bobX = pivotX + length * Math.sin(state.angle);
      const bobY = pivotY + length * Math.cos(state.angle);

      // Draw string
      ctx.strokeStyle = "rgba(0, 217, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Draw pivot point
      ctx.fillStyle = "rgba(0, 217, 255, 0.8)";
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw bob
      ctx.fillStyle = "rgba(255, 181, 0, 0.9)";
      ctx.beginPath();
      ctx.arc(bobX, bobY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Draw bob glow
      ctx.strokeStyle = "rgba(255, 181, 0, 0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bobX, bobY, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Draw info text
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "14px Inter";
      ctx.fillText(
        `Angle: ${(state.angle * (180 / Math.PI)).toFixed(1)}°`,
        20,
        30
      );
      ctx.fillText(
        `Angular Velocity: ${state.angularVelocity.toFixed(2)} rad/s`,
        20,
        50
      );
      ctx.fillText(`Length: ${length}px`, 20, 70);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [length, damping, isRunning, gravity]);

  const handleReset = () => {
    setIsRunning(false);
    stateRef.current = {
      angle: angle * (Math.PI / 180),
      angularVelocity: 0,
      angularAcceleration: 0,
      time: 0,
    };
  };

  return (
    <SimulationLayout
      title="Маятник - Simple Pendulum"
      canvas={
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="w-full h-full max-w-md mx-auto"
        />
      }
      controls={
        <div className="space-y-6">
          {/* Initial Angle */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Начальный угол, °
            </label>
            <input
              type="number"
              min="0"
              max="89"
              step="1"
              value={inputAngle}
              onChange={(e) => setInputAngle(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
              placeholder="Введите угол"
            />
          </div>

          {/* Length */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Длина нити, пиксели
            </label>
            <input
              type="number"
              min="50"
              max="300"
              step="10"
              value={inputLength}
              onChange={(e) => setInputLength(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
              placeholder="Введите длину"
            />
          </div>

          {/* Gravity */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Гравитация, м/с²
            </label>
            <input
              type="number"
              min="1"
              max="20"
              step="0.1"
              value={inputGravity}
              onChange={(e) => setInputGravity(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
              placeholder="Введите гравитацию"
            />
          </div>

          {/* Damping */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Плотность среды, %
            </label>
            <input
              type="number"
              min="0.95"
              max="1"
              step="0.01"
              value={inputDamping}
              onChange={(e) => setInputDamping(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
              placeholder="Введите плотность"
            />
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={isRunning}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            Рассчитать
          </button>

          {/* Buttons */}
          <div className="pt-4 space-y-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isRunning
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30"
                  : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30"
              }`}
            >
              {isRunning ? "Пауза" : "Пуск"}
            </button>
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 border border-slate-600 hover:border-cyan-400 rounded-lg transition-colors text-slate-300 hover:text-cyan-400 font-semibold"
            >
              Сброс
            </button>
          </div>
        </div>
      }
    >
      <div>
        <h2 className="text-xl font-bold text-neon-cyan mb-4">
          About Simple Pendulum
        </h2>
        <p className="text-slate-300 mb-4">
          A simple pendulum consists of a small mass (bob) suspended from a
          fixed point by a light string or rod. The motion follows simple
          harmonic motion for small angles.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Period Formula</p>
            <p className="text-slate-400 mt-2">T = 2π√(L/g)</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Angular Acceleration</p>
            <p className="text-slate-400 mt-2">α = -(g/L)sin(θ)</p>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
