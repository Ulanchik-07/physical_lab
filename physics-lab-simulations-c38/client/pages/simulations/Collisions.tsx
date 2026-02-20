import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  trail: { x: number; y: number }[];
}

export default function Collisions() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Controls
  const [mass1, setMass1] = useState(1);
  const [mass2, setMass2] = useState(1);
  const [velocity1, setVelocity1] = useState(5);
  const [velocity2, setVelocity2] = useState(-3);
  const [collisionType, setCollisionType] = useState<"elastic" | "inelastic">("elastic");
  const [isRunning, setIsRunning] = useState(false);

  // Input fields
  const [inputMass1, setInputMass1] = useState("1");
  const [inputVelocity1, setInputVelocity1] = useState("5");
  const [inputMass2, setInputMass2] = useState("1");
  const [inputVelocity2, setInputVelocity2] = useState("-3");

  const handleCalculate = () => {
    const m1 = parseFloat(inputMass1) || 1;
    const v1 = parseFloat(inputVelocity1) || 5;
    const m2 = parseFloat(inputMass2) || 1;
    const v2 = parseFloat(inputVelocity2) || -3;
    
    setMass1(Math.min(3, Math.max(0.5, m1)));
    setVelocity1(Math.min(10, Math.max(-10, v1)));
    setMass2(Math.min(3, Math.max(0.5, m2)));
    setVelocity2(Math.min(10, Math.max(-10, v2)));
    setIsRunning(false);
  };

  const stateRef = useRef<{
    ball1: Ball;
    ball2: Ball;
    time: number;
  }>({
    ball1: {
      x: 120,
      y: 250,
      vx: velocity1,
      vy: 0,
      mass: mass1,
      radius: Math.sqrt(mass1) * 8,
      trail: [],
    },
    ball2: {
      x: 480,
      y: 250,
      vx: velocity2,
      vy: 0,
      mass: mass2,
      radius: Math.sqrt(mass2) * 8,
      trail: [],
    },
    time: 0,
  });

  // Calculate momentum and energy
  const momentum1 = mass1 * velocity1;
  const momentum2 = mass2 * velocity2;
  const totalMomentum = momentum1 + momentum2;
  const ke1 = 0.5 * mass1 * velocity1 ** 2;
  const ke2 = 0.5 * mass2 * velocity2 ** 2;
  const totalKE = ke1 + ke2;

  const resetSimulation = () => {
    stateRef.current = {
      ball1: {
        x: 120,
        y: 250,
        vx: velocity1,
        vy: 0,
        mass: mass1,
        radius: Math.sqrt(mass1) * 8,
        trail: [],
      },
      ball2: {
        x: 480,
        y: 250,
        vx: velocity2,
        vy: 0,
        mass: mass2,
        radius: Math.sqrt(mass2) * 8,
        trail: [],
      },
      time: 0,
    };
  };

  useEffect(() => {
    if (isRunning) {
      resetSimulation();
    }
  }, [isRunning, mass1, mass2, velocity1, velocity2, collisionType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      if (isRunning) {
        const state = stateRef.current;
        const dt = 0.016;

        const b1 = state.ball1;
        const b2 = state.ball2;

        // Update positions
        b1.x += b1.vx * dt * 30;
        b2.x += b2.vx * dt * 30;

        // Check collision
        const dx = b2.x - b1.x;
        const dist = Math.abs(dx);
        const minDist = b1.radius + b2.radius;

        if (dist < minDist && dx !== 0) {
          // Collision detected
          if (collisionType === "elastic") {
            // Elastic collision
            const v1 =
              ((b1.mass - b2.mass) * b1.vx + 2 * b2.mass * b2.vx) /
              (b1.mass + b2.mass);
            const v2 =
              ((b2.mass - b1.mass) * b2.vx + 2 * b1.mass * b1.vx) /
              (b1.mass + b2.mass);
            b1.vx = v1;
            b2.vx = v2;
          } else {
            // Inelastic collision
            const vf = (b1.mass * b1.vx + b2.mass * b2.vx) / (b1.mass + b2.mass);
            b1.vx = vf;
            b2.vx = vf;
          }

          // Separate balls
          b1.x -= (minDist - dist) / 2;
          b2.x += (minDist - dist) / 2;
        }

        // Boundary check
        if (b1.x - b1.radius < 0) {
          b1.x = b1.radius;
          b1.vx = Math.abs(b1.vx);
        }
        if (b1.x + b1.radius > canvas.width) {
          b1.x = canvas.width - b1.radius;
          b1.vx = -Math.abs(b1.vx);
        }
        if (b2.x - b2.radius < 0) {
          b2.x = b2.radius;
          b2.vx = Math.abs(b2.vx);
        }
        if (b2.x + b2.radius > canvas.width) {
          b2.x = canvas.width - b2.radius;
          b2.vx = -Math.abs(b2.vx);
        }

        // Add to trail
        b1.trail.push({ x: b1.x, y: b1.y });
        b2.trail.push({ x: b2.x, y: b2.y });
        if (b1.trail.length > 100) b1.trail.shift();
        if (b2.trail.length > 100) b2.trail.shift();

        state.time += dt;
      }

      // Draw
      const width = canvas.width;
      const height = canvas.height;

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

      const state = stateRef.current;

      // Draw trails
      ctx.strokeStyle = "rgba(100, 150, 255, 0.3)";
      ctx.lineWidth = 1;
      if (state.ball1.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(state.ball1.trail[0].x, state.ball1.trail[0].y);
        for (let i = 1; i < state.ball1.trail.length; i++) {
          ctx.lineTo(state.ball1.trail[i].x, state.ball1.trail[i].y);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(255, 100, 150, 0.3)";
      if (state.ball2.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(state.ball2.trail[0].x, state.ball2.trail[0].y);
        for (let i = 1; i < state.ball2.trail.length; i++) {
          ctx.lineTo(state.ball2.trail[i].x, state.ball2.trail[i].y);
        }
        ctx.stroke();
      }

      // Draw balls
      ctx.fillStyle = "rgba(100, 150, 255, 0.8)";
      ctx.beginPath();
      ctx.arc(state.ball1.x, state.ball1.y, state.ball1.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 100, 150, 0.8)";
      ctx.beginPath();
      ctx.arc(state.ball2.x, state.ball2.y, state.ball2.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw info
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "12px Inter";
      ctx.fillText(
        `Ball 1: m=${mass1}, v=${state.ball1.vx.toFixed(2)}`,
        20,
        30
      );
      ctx.fillText(
        `Ball 2: m=${mass2}, v=${state.ball2.vx.toFixed(2)}`,
        20,
        50
      );
      ctx.fillText(`Total momentum: ${(state.ball1.mass * state.ball1.vx + state.ball2.mass * state.ball2.vx).toFixed(2)}`, 20, 70);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mass1, mass2, velocity1, velocity2, isRunning, collisionType]);

  return (
    <SimulationLayout
      title="Столкновения - Collisions"
      canvas={
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full h-full max-w-2xl mx-auto"
        />
      }
      controls={
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Тип столкновения
            </label>
            <select
              value={collisionType}
              onChange={(e) => setCollisionType(e.target.value as "elastic" | "inelastic")}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            >
              <option value="elastic">Упругое (Elastic)</option>
              <option value="inelastic">Неупругое (Inelastic)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Масса шара 1, кг
            </label>
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              value={inputMass1}
              onChange={(e) => setInputMass1(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400 disabled:opacity-50"
              placeholder="Введите массу"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Скорость шара 1, м/с
            </label>
            <input
              type="number"
              min="-10"
              max="10"
              step="0.5"
              value={inputVelocity1}
              onChange={(e) => setInputVelocity1(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
              placeholder="Введите скорость"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Масса шара 2, кг
            </label>
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              value={inputMass2}
              onChange={(e) => setInputMass2(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400 disabled:opacity-50"
              placeholder="Введите массу"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Скорость шара 2, м/с
            </label>
            <input
              type="number"
              min="-10"
              max="10"
              step="0.5"
              value={inputVelocity2}
              onChange={(e) => setInputVelocity2(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
              placeholder="Введите скорость"
            />
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={handleCalculate}
              disabled={isRunning}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              Рассчитать
            </button>
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
                resetSimulation();
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
            Столкновения и импульс
          </h2>
          <p className="text-slate-300 mb-4">
            Наблюдайте взаимодействие между двумя объектами при упругом и неупругом столкновении.
            Импульс сохраняется во всех случаях.
          </p>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <p className="font-semibold text-neon-cyan mb-2">Закон сохранения импульса</p>
          <p className="text-slate-400 font-mono">p = m·v = const</p>
          <p className="text-xs text-slate-500 mt-2">
            Суммарный импульс системы не изменяется в отсутствие внешних сил
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Упругое столкновение</p>
            <p className="text-slate-400 mt-2">КЭ сохраняется</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Неупругое столкновение</p>
            <p className="text-slate-400 mt-2">КЭ теряется</p>
          </div>
        </div>

        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-neon-cyan mb-3">Текущие значения</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Импульс шара 1:</span>
              <span className="text-neon-cyan font-mono">{momentum1.toFixed(2)} кг·м/с</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Импульс шара 2:</span>
              <span className="text-neon-cyan font-mono">{momentum2.toFixed(2)} кг·м/с</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Суммарный импульс:</span>
              <span className="text-neon-amber font-mono">{totalMomentum.toFixed(2)} кг·м/с</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Суммарная КЭ:</span>
              <span className="text-neon-amber font-mono">{totalKE.toFixed(2)} Дж</span>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
