import { useState, useRef, useEffect, useCallback } from "react";
import SimulationLayout from "@/components/SimulationLayout";

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
  time: number;
}

export default function ProjectileMotion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Controls
  const [initialVelocity, setInitialVelocity] = useState(30);
  const [angle, setAngle] = useState(45);
  const [gravity, setGravity] = useState(9.81);
  const [isRunning, setIsRunning] = useState(false);
  const [showTrajectory, setShowTrajectory] = useState(true);

  // Input fields
  const [inputVelocity, setInputVelocity] = useState("30");
  const [inputAngle, setInputAngle] = useState("45");
  const [inputGravity, setInputGravity] = useState("9.81");

  const handleCalculate = () => {
    const v = parseFloat(inputVelocity) || 30;
    const a = parseFloat(inputAngle) || 45;
    const g = parseFloat(inputGravity) || 9.81;
    
    setInitialVelocity(Math.min(100, Math.max(10, v)));
    setAngle(Math.min(90, Math.max(0, a)));
    setGravity(Math.min(20, Math.max(1, g)));
    setIsRunning(false);
    resetProjectile();
  };

  // Simulation state
  const stateRef = useRef<{
    projectile: Projectile;
    isActive: boolean;
  }>({
    projectile: {
      x: 100,
      y: 450,
      vx: 0,
      vy: 0,
      trail: [],
      time: 0,
    },
    isActive: false,
  });

  // Calculate range and max height
  const angleRad = (angle * Math.PI) / 180;
  const maxHeight = (initialVelocity ** 2 * Math.sin(angleRad) ** 2) / (2 * gravity);
  const range = (initialVelocity ** 2 * Math.sin(2 * angleRad)) / gravity;
  const flightTime = (2 * initialVelocity * Math.sin(angleRad)) / gravity;

  // Reset projectile function
  const resetProjectile = useCallback(() => {
    const angleRad = (angle * Math.PI) / 180;
    const scale = 5; // pixels per m/s

    stateRef.current.projectile = {
      x: 100,
      y: 450,
      vx: initialVelocity * Math.cos(angleRad) * scale,
      vy: -initialVelocity * Math.sin(angleRad) * scale,
      trail: [],
      time: 0,
    };
    stateRef.current.time = 0;
  }, [angle, initialVelocity]);

  // Update isActive when isRunning changes
  useEffect(() => {
    stateRef.current.isActive = isRunning;
    if (isRunning) {
      resetProjectile();
    }
  }, [isRunning, resetProjectile]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = Date.now();

    const animate = () => {
      const state = stateRef.current;
      const currentTime = Date.now();
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05); // Cap at 50ms
      lastTime = currentTime;

      // Physics simulation
      if (state.isActive) {
        const scaledGravity = gravity * 3; // Scale for canvas

        // Update velocity
        state.projectile.vy += scaledGravity * deltaTime;

        // Update position
        state.projectile.x += state.projectile.vx * deltaTime;
        state.projectile.y += state.projectile.vy * deltaTime;

        // Add to trail
        state.projectile.trail.push({
          x: state.projectile.x,
          y: state.projectile.y,
        });
        if (state.projectile.trail.length > 200) {
          state.projectile.trail.shift();
        }

        // Stop if hit ground
        if (state.projectile.y >= 450) {
          state.projectile.y = 450;
          state.isActive = false;
          setIsRunning(false);
        }

        state.time += deltaTime;
      }

      // Drawing
      const projectile = state.projectile;

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

      // Draw ground line
      ctx.strokeStyle = "rgba(0, 217, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 450);
      ctx.lineTo(canvas.width, 450);
      ctx.stroke();

      // Draw trail
      if (projectile.trail.length > 1) {
        ctx.strokeStyle = "rgba(0, 217, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(projectile.trail[0].x, projectile.trail[0].y);
        for (let i = 1; i < projectile.trail.length; i++) {
          ctx.lineTo(projectile.trail[i].x, projectile.trail[i].y);
        }
        ctx.stroke();
      }

      // Draw projectile
      ctx.fillStyle = "rgba(255, 181, 0, 0.9)";
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw projectile glow
      ctx.strokeStyle = "rgba(255, 181, 0, 0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Draw velocity vector
      const vectorScale = 0.05;
      ctx.strokeStyle = "rgba(0, 217, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(projectile.x, projectile.y);
      ctx.lineTo(
        projectile.x + projectile.vx * vectorScale,
        projectile.y + projectile.vy * vectorScale
      );
      ctx.stroke();

      // Draw info text
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "14px Inter";
      ctx.fillText(`Velocity: ${initialVelocity} m/s`, 20, 30);
      ctx.fillText(`Angle: ${angle}°`, 20, 50);
      ctx.fillText(`Distance: ${(projectile.x / 5).toFixed(1)} m`, 20, 70);
      ctx.fillText(
        `Height: ${Math.max(0, (450 - projectile.y) / 5).toFixed(1)} m`,
        20,
        90
      );
      ctx.fillText(`Time: ${state.time.toFixed(2)}s`, 20, 110);

      // Calculate theoretical max range
      const angleRad = (angle * Math.PI) / 180;
      const g = 9.81;
      const v = initialVelocity;
      const maxRange = (v * v * Math.sin(2 * angleRad)) / g;
      ctx.fillText(`Max Range: ${maxRange.toFixed(1)} m`, 20, 130);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initialVelocity, angle, gravity]);

  return (
    <SimulationLayout
      title="Движение снаряда - Projectile Motion"
      canvas={
        <canvas
          ref={canvasRef}
          width={600}
          height={500}
          className="w-full h-full max-w-2xl mx-auto"
        />
      }
      controls={
        <div className="space-y-6">
          {/* Initial Velocity */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Начальная скорость, м/с
            </label>
            <input
              type="number"
              min="10"
              max="100"
              step="1"
              value={inputVelocity}
              onChange={(e) => setInputVelocity(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
              placeholder="Введите скорость"
            />
          </div>

          {/* Angle */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Угол запуска, °
            </label>
            <input
              type="number"
              min="0"
              max="90"
              step="1"
              value={inputAngle}
              onChange={(e) => setInputAngle(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
              placeholder="Введите угол"
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
              onClick={() => {
                setIsRunning(false);
                resetProjectile();
              }}
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
          About Projectile Motion
        </h2>
        <p className="text-slate-300 mb-4">
          Projectile motion occurs when an object is launched at an angle and
          follows a curved path under the influence of gravity. The horizontal
          and vertical components of motion are independent.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Range Formula</p>
            <p className="text-slate-400 mt-2">R = (v²sin(2θ))/g</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Max Height</p>
            <p className="text-slate-400 mt-2">H = (v²sin²(θ))/(2g)</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Flight Time</p>
            <p className="text-slate-400 mt-2">T = (2v·sin(θ))/g</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Optimal Angle</p>
            <p className="text-slate-400 mt-2">45° for max range</p>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
