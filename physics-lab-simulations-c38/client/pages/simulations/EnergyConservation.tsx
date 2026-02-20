import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

interface ObjectState {
  height: number;
  velocity: number;
  isMoving: boolean;
}

export default function EnergyConservation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Controls
  const [mass, setMass] = useState(1);
  const [initialHeight, setInitialHeight] = useState(300);
  const [gravity, setGravity] = useState(9.81);
  const [drop, setDrop] = useState(false);
  const [showEnergy, setShowEnergy] = useState(true);

  // Input states for Calculate button
  const [inputMass, setInputMass] = useState("1");
  const [inputInitialHeight, setInputInitialHeight] = useState("300");
  const [inputGravity, setInputGravity] = useState("9.81");

  // Handle calculate
  const handleCalculate = () => {
    const m = parseFloat(inputMass);
    const h = parseFloat(inputInitialHeight);
    const g = parseFloat(inputGravity);

    if (isNaN(m) || isNaN(h) || isNaN(g)) {
      alert("Пожалуйста введите корректные числа");
      return;
    }

    if (m < 0.5 || m > 3) {
      alert("Масса должна быть от 0.5 до 3 кг");
      return;
    }
    if (h < 50 || h > 350) {
      alert("Начальная высота должна быть от 50 до 350");
      return;
    }
    if (g < 1 || g > 20) {
      alert("Гравитация должна быть от 1 до 20 м/с²");
      return;
    }

    setMass(m);
    setInitialHeight(h);
    setGravity(g);
  };

  // Simulation state
  const stateRef = useRef<ObjectState>({
    height: initialHeight,
    velocity: 0,
    isMoving: false,
  });

  // Calculate energies
  const potentialEnergy = mass * gravity * (initialHeight / 100); // Convert pixels to meters
  const kineticEnergy = 0.5 * mass * (stateRef.current.velocity ** 2) / 10000;
  const totalEnergy = potentialEnergy + kineticEnergy;
  const currentHeight = stateRef.current.height;

  // Load initial in useEffect
  useEffect(() => {
    stateRef.current.height = initialHeight;
    stateRef.current.velocity = 0;
    stateRef.current.isMoving = false;
  }, [initialHeight]);

  // Start drop
  useEffect(() => {
    if (drop) {
      stateRef.current.isMoving = true;
    }
  }, [drop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      const state = stateRef.current;
      const groundY = canvas.height - 50;

      // Physics
      if (state.isMoving && state.height > 50) {
        const dt = 0.016; // ~60 FPS
        state.velocity += gravity * dt * 30; // Scale for canvas
        state.height += state.velocity * dt;

        if (state.height >= groundY) {
          state.height = groundY;
          state.velocity = 0;
          state.isMoving = false;
          setDrop(false);
        }
      }

      // Draw
      const width = canvas.width;
      const height = canvas.height;

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

      // Draw ground
      ctx.fillStyle = "rgba(100, 150, 255, 0.2)";
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.strokeStyle = "rgba(0, 217, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Draw height reference
      ctx.strokeStyle = "rgba(0, 217, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(50, initialHeight);
      ctx.lineTo(50, state.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw object
      const objSize = Math.sqrt(mass) * 8;
      ctx.fillStyle = "rgba(255, 181, 0, 0.9)";
      ctx.beginPath();
      ctx.arc(width / 2, state.height, objSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw velocity vector
      if (state.velocity > 0.5) {
        ctx.strokeStyle = "rgba(100, 200, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2, state.height);
        ctx.lineTo(width / 2, state.height + state.velocity * 3);
        ctx.stroke();

        // Arrow
        const len = state.velocity * 3;
        if (len > 0) {
          const arrowSize = 8;
          ctx.beginPath();
          ctx.moveTo(width / 2, state.height + len);
          ctx.lineTo(width / 2 - arrowSize, state.height + len - arrowSize);
          ctx.lineTo(width / 2 + arrowSize, state.height + len - arrowSize);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Draw energy pie chart
      if (showEnergy) {
        const chartX = width - 120;
        const chartY = 60;
        const chartRadius = 40;

        const totalE = potentialEnergy + kineticEnergy;
        const peRatio = totalE > 0 ? potentialEnergy / totalE : 0;

        // PE arc
        ctx.fillStyle = "rgba(100, 150, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(chartX, chartY, chartRadius, 0, peRatio * Math.PI * 2);
        ctx.lineTo(chartX, chartY);
        ctx.closePath();
        ctx.fill();

        // KE arc
        ctx.fillStyle = "rgba(100, 255, 150, 0.8)";
        ctx.beginPath();
        ctx.arc(chartX, chartY, chartRadius, peRatio * Math.PI * 2, Math.PI * 2);
        ctx.lineTo(chartX, chartY);
        ctx.closePath();
        ctx.fill();

        // Border
        ctx.strokeStyle = "rgba(0, 217, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(chartX, chartY, chartRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Info text
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "12px Inter";
      ctx.textAlign = "left";

      ctx.fillText(`Height: ${(state.height / 100).toFixed(2)}m`, 20, 25);
      ctx.fillText(`Velocity: ${(state.velocity / 50).toFixed(2)}m/s`, 20, 45);
      ctx.fillText(`PE: ${potentialEnergy.toFixed(2)} J`, 20, 65);
      ctx.fillText(`KE: ${kineticEnergy.toFixed(2)} J`, 20, 85);
      ctx.fillText(`Total: ${totalEnergy.toFixed(2)} J`, 20, 105);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mass, gravity, potentialEnergy, kineticEnergy, showEnergy, initialHeight]);

  return (
    <SimulationLayout
      title="Сохранение энергии - Energy Conservation"
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
          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            Рассчитать
          </button>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Масса: {mass.toFixed(2)} кг
            </label>
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              value={inputMass}
              onChange={(e) => setInputMass(e.target.value)}
              disabled={stateRef.current.isMoving}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Начальная высота: {(initialHeight / 100).toFixed(2)}м
            </label>
            <input
              type="number"
              min="50"
              max="350"
              step="10"
              value={inputInitialHeight}
              onChange={(e) => setInputInitialHeight(e.target.value)}
              disabled={stateRef.current.isMoving}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Гравитация: {gravity.toFixed(2)} м/с²
            </label>
            <input
              type="number"
              min="1"
              max="20"
              step="0.1"
              value={inputGravity}
              onChange={(e) => setInputGravity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showEnergy}
                onChange={(e) => setShowEnergy(e.target.checked)}
                className="w-4 h-4 accent-neon-cyan"
              />
              <span className="text-sm text-slate-300">Показать диаграмму энергии</span>
            </label>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setDrop(true)}
              disabled={stateRef.current.isMoving}
              className="w-full py-3 px-4 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30 rounded-lg transition-colors text-slate-300 hover:text-neon-cyan font-semibold disabled:opacity-50"
            >
              Отпустить
            </button>
            <button
              onClick={() => {
                stateRef.current = { height: initialHeight, velocity: 0, isMoving: false };
                setDrop(false);
              }}
              className="w-full mt-3 py-3 px-4 border border-slate-600 hover:border-neon-cyan rounded-lg transition-colors text-slate-300 hover:text-neon-cyan font-semibold"
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
            Сохранение механической энергии
          </h2>
          <p className="text-slate-300 mb-4">
            В отсутствие внешних сил (трения и сопротивления воздуха) механическая энергия системы сохраняется.
            Потенциальная энергия преобразуется в кинетическую, и наоборот.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Потенциальная энергия</p>
            <p className="text-slate-400 mt-1">PE = mgh</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Кинетическая энергия</p>
            <p className="text-slate-400 mt-1">KE = ½mv²</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Полная механическая энергия</p>
            <p className="text-slate-400 mt-1">E = PE + KE = const</p>
          </div>
        </div>

        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-neon-cyan mb-3">Преобразование энергии</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <div>• На начальной высоте: E = mgh (вся PE)</div>
            <div>• При падении: PE → KE</div>
            <div>• На земле: E = ½mv² (вся KE)</div>
            <div>• Total E всегда сохраняется</div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
