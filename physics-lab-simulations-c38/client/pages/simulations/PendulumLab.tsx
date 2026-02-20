import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

interface PendulumState {
  angle: number;
  angularVelocity: number;
  angularAcceleration: number;
  time: number;
  period: number;
  energy: number;
}

interface Measurement {
  time: number;
  angle: number;
  velocity: number;
}

export default function PendulumLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Controls
  const [length, setLength] = useState(200);
  const [mass, setMass] = useState(1);
  const [angle, setAngle] = useState(45);
  const [damping, setDamping] = useState(0.99);
  const [isRunning, setIsRunning] = useState(false);
  const [gravity, setGravity] = useState(9.81);
  const [showMeasurements, setShowMeasurements] = useState(true);

  // Measurements
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [lastZeroCrossing, setLastZeroCrossing] = useState(0);
  const [oscillationCount, setOscillationCount] = useState(0);

  // Simulation state
  const stateRef = useRef<PendulumState>({
    angle: angle * (Math.PI / 180),
    angularVelocity: 0,
    angularAcceleration: 0,
    time: 0,
    period: 2 * Math.PI * Math.sqrt(length / (gravity * 100)),
    energy: 0,
  });

  // Calculate theoretical period
  const theoreticalPeriod = 2 * Math.PI * Math.sqrt(length / (gravity * 100));

  // Update angle when slider changes
  useEffect(() => {
    if (!isRunning) {
      stateRef.current.angle = angle * (Math.PI / 180);
      stateRef.current.angularVelocity = 0;
      setMeasurements([]);
      setOscillationCount(0);
      setLastZeroCrossing(0);
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
          -(gravity / (length / 100)) * Math.sin(state.angle);

        // Update velocity and position
        state.angularVelocity += state.angularAcceleration * dt;
        state.angularVelocity *= damping;
        state.angle += state.angularVelocity * dt;

        // Calculate total mechanical energy
        const potentialEnergy = mass * gravity * length / 100 * (1 - Math.cos(state.angle));
        const kineticEnergy = 0.5 * mass * (length / 100 * state.angularVelocity) ** 2;
        state.energy = potentialEnergy + kineticEnergy;

        state.time += dt;

        // Record measurements
        if (state.time % 0.05 < dt) {
          const measurement: Measurement = {
            time: state.time,
            angle: state.angle,
            velocity: state.angularVelocity,
          };
          setMeasurements((prev) => {
            const updated = [...prev];
            if (updated.length > 1000) updated.shift();
            return updated;
          });

          // Detect zero crossings for period calculation
          if (measurements.length > 0) {
            const prev = measurements[measurements.length - 1];
            if (
              prev.angle > 0 &&
              state.angle <= 0 &&
              state.time - lastZeroCrossing > 0.5
            ) {
              setLastZeroCrossing(state.time);
              setOscillationCount((c) => c + 1);
            }
          }
        }
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

      // Pivot point
      const pivotX = canvas.width / 2;
      const pivotY = canvas.height / 4;

      // Calculate bob position
      const bobX = pivotX + length * Math.sin(state.angle);
      const bobY = pivotY + length * Math.cos(state.angle);

      // Draw trajectory (arc)
      ctx.strokeStyle = "rgba(100, 150, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, length, 0, Math.PI * 2);
      ctx.stroke();

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
      ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
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
      ctx.font = "12px Inter";
      ctx.fillText(`Time: ${state.time.toFixed(2)}s`, 20, 30);
      ctx.fillText(`Angle: ${(state.angle * (180 / Math.PI)).toFixed(1)}°`, 20, 50);
      ctx.fillText(
        `ω: ${state.angularVelocity.toFixed(2)} rad/s`,
        20,
        70
      );
      ctx.fillText(`E: ${state.energy.toFixed(2)} J`, 20, 90);
      ctx.fillText(
        `T (теор): ${theoreticalPeriod.toFixed(3)}s`,
        20,
        110
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [length, damping, isRunning, gravity, mass, theoreticalPeriod, measurements, lastZeroCrossing]);

  const handleReset = () => {
    setIsRunning(false);
    stateRef.current = {
      angle: angle * (Math.PI / 180),
      angularVelocity: 0,
      angularAcceleration: 0,
      time: 0,
      period: theoreticalPeriod,
      energy: 0,
    };
    setMeasurements([]);
    setOscillationCount(0);
    setLastZeroCrossing(0);
  };

  return (
    <SimulationLayout
      title="Лаборатория маятника - Pendulum Lab"
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
              Начальный угол: {angle}°
            </label>
            <input
              type="range"
              min="0"
              max="89"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              disabled={isRunning}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-amber disabled:opacity-50"
            />
            <p className="text-xs text-slate-400 mt-1">Начальное смещение</p>
          </div>

          {/* Length */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Длина нити: {(length / 100).toFixed(2)}м
            </label>
            <input
              type="range"
              min="50"
              max="300"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              disabled={isRunning}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-amber disabled:opacity-50"
            />
            <p className="text-xs text-slate-400 mt-1">Длина нити маятника</p>
          </div>

          {/* Mass */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Масса: {mass.toFixed(2)} кг
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              disabled={isRunning}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-amber disabled:opacity-50"
            />
            <p className="text-xs text-slate-400 mt-1">Масса груза</p>
          </div>

          {/* Gravity */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Гравитация: {gravity.toFixed(2)} м/с²
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              disabled={isRunning}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-amber disabled:opacity-50"
            />
            <p className="text-xs text-slate-400 mt-1">Ускорение свободного падения</p>
          </div>

          {/* Damping */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Затухание: {((1 - damping) * 100).toFixed(1)}%
            </label>
            <input
              type="range"
              min="0.95"
              max="1"
              step="0.01"
              value={damping}
              onChange={(e) => setDamping(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-amber"
            />
            <p className="text-xs text-slate-400 mt-1">Сопротивление воздуха</p>
          </div>

          {/* Buttons */}
          <div className="pt-4 space-y-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                isRunning
                  ? "bg-neon-amber/20 text-neon-amber border border-neon-amber/50 hover:bg-neon-amber/30"
                  : "btn-neon-cyan"
              }`}
            >
              {isRunning ? "Пауза" : "Старт"}
            </button>
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 border border-slate-600 hover:border-neon-cyan rounded-lg transition-colors text-slate-300 hover:text-neon-cyan font-semibold"
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
            О простом маятнике
          </h2>
          <p className="text-slate-300 mb-4">
            Простой маятник состоит из груза, подвешенного на нити. При малых углах
            его движение описывается гармоническими колебаниями.
          </p>
        </div>

        {/* Formulas */}
        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan mb-2">Период колебаний</p>
            <p className="text-slate-400">T = 2π√(L/g)</p>
            <p className="text-xs text-slate-500 mt-2">
              L - длина нити, g - ускорение свободного падения
            </p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan mb-2">Угловое ускорение</p>
            <p className="text-slate-400">α = -(g/L)sin(θ)</p>
            <p className="text-xs text-slate-500 mt-2">
              θ - угол отклонения от вертикали
            </p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan mb-2">Полная энергия</p>
            <p className="text-slate-400">E = ½m(Lω)² + mgL(1-cos θ)</p>
            <p className="text-xs text-slate-500 mt-2">
              E = Ekinetic + Epotential
            </p>
          </div>
        </div>

        {/* Measurements */}
        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-neon-cyan mb-3">Измерения</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
              <p className="text-slate-400">Теор. период:</p>
              <p className="text-neon-cyan font-mono">{theoreticalPeriod.toFixed(3)}s</p>
            </div>
            <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
              <p className="text-slate-400">Осцилляций:</p>
              <p className="text-neon-cyan font-mono">{oscillationCount}</p>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
