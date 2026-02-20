import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

export default function ElectricCircuit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Controls
  const [voltage, setVoltage] = useState(12); // Volts
  const [resistance, setResistance] = useState(4); // Ohms
  const [isRunning, setIsRunning] = useState(false);

  // Input states for Calculate button
  const [inputVoltage, setInputVoltage] = useState("12");
  const [inputResistance, setInputResistance] = useState("4");

  // Handle calculate
  const handleCalculate = () => {
    const vol = parseFloat(inputVoltage);
    const res = parseFloat(inputResistance);

    if (isNaN(vol) || isNaN(res)) {
      alert("Пожалуйста введите корректные числа");
      return;
    }

    if (vol < 1 || vol > 24) {
      alert("Напряжение должно быть от 1 до 24 Вольт");
      return;
    }
    if (res < 0.5 || res > 20) {
      alert("Сопротивление должно быть от 0.5 до 20 Ом");
      return;
    }

    setVoltage(vol);
    setResistance(res);
  };

  // Calculated values
  const current = voltage / resistance; // Amperes
  const power = voltage * current; // Watts
  const energy = power * 0.001; // Joules per millisecond

  // Particle state for visualization
  const particlesRef = useRef<
    { x: number; y: number; progress: number }[]
  >([]);

  useEffect(() => {
    if (isRunning && particlesRef.current.length < 20) {
      particlesRef.current.push({
        x: 50,
        y: 250,
        progress: 0,
      });
    }
  }, [isRunning]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Update particles
      if (isRunning) {
        const speed = 100 + current * 30; // Speed based on current
        particlesRef.current.forEach((p, i) => {
          p.progress += speed / 10000;
          if (p.progress > 1) {
            particlesRef.current.splice(i, 1);
          } else {
            // Animate along circuit path
            if (p.progress < 0.25) {
              p.x = 50 + p.progress * 4 * 150;
              p.y = 250;
            } else if (p.progress < 0.5) {
              p.x = 250;
              p.y = 250 - (p.progress - 0.25) * 4 * 100;
            } else if (p.progress < 0.75) {
              p.x = 250 - (p.progress - 0.5) * 4 * 200;
              p.y = 150;
            } else {
              p.x = 50;
              p.y = 150 + (p.progress - 0.75) * 4 * 100;
            }
          }
        });
      }

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

      // Draw circuit
      ctx.strokeStyle = "rgba(0, 217, 255, 0.6)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(50, 250); // Start at bottom left
      ctx.lineTo(250, 250); // Right
      ctx.lineTo(250, 150); // Up
      ctx.lineTo(50, 150); // Left
      ctx.closePath();
      ctx.stroke();

      // Draw voltage source
      ctx.fillStyle = "rgba(255, 181, 0, 0.8)";
      ctx.beginPath();
      ctx.arc(50, 250, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.font = "bold 10px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${voltage}V`, 50, 250);

      // Draw resistor (zigzag)
      ctx.strokeStyle = "rgba(255, 181, 0, 0.8)";
      ctx.lineWidth = 2;
      const resistorX = 250;
      const resistorY = 200;
      const zigWidth = 20;
      const zigHeight = 15;
      ctx.beginPath();
      ctx.moveTo(resistorX - 30, resistorY);
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(
          resistorX - 30 + zigWidth / 2 + i * zigWidth,
          resistorY - zigHeight
        );
        ctx.lineTo(
          resistorX - 30 + zigWidth + i * zigWidth,
          resistorY + zigHeight
        );
      }
      ctx.lineTo(resistorX + 30, resistorY);
      ctx.stroke();

      // Draw resistor label
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "12px Inter";
      ctx.textAlign = "center";
      ctx.fillText(`R=${resistance}Ω`, 250, 130);

      // Draw particles (electrons)
      particlesRef.current.forEach((p) => {
        ctx.fillStyle = `rgba(0, 217, 255, ${0.8 * (1 - p.progress)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw info panel
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(10, 10, 220, 120);
      ctx.strokeStyle = "rgba(0, 217, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, 220, 120);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "12px Inter";
      ctx.textAlign = "left";
      ctx.fillText(`Voltage (U): ${voltage.toFixed(1)}V`, 20, 30);
      ctx.fillText(`Resistance (R): ${resistance.toFixed(1)}Ω`, 20, 50);
      ctx.fillText(
        `Current (I): ${current.toFixed(2)}A`,
        20,
        70
      );
      ctx.fillText(`Power (P): ${power.toFixed(2)}W`, 20, 90);
      ctx.fillText(`Formula: I = U/R`, 20, 110);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [voltage, resistance, isRunning, current, power]);

  return (
    <SimulationLayout
      title="Электрическая цепь - Electric Circuit"
      canvas={
        <canvas
          ref={canvasRef}
          width={500}
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

          {/* Voltage Control */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Voltage: {voltage.toFixed(1)} V
            </label>
            <input
              type="number"
              min="1"
              max="24"
              step="0.1"
              value={inputVoltage}
              onChange={(e) => setInputVoltage(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
            />
            <p className="text-xs text-slate-400 mt-1">
              Voltage source in volts
            </p>
          </div>

          {/* Resistance Control */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Resistance: {resistance.toFixed(1)} Ω
            </label>
            <input
              type="number"
              min="0.5"
              max="20"
              step="0.1"
              value={inputResistance}
              onChange={(e) => setInputResistance(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
            />
            <p className="text-xs text-slate-400 mt-1">
              Resistance in ohms
            </p>
          </div>

          {/* Calculated Values */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-2">
            <p className="text-sm text-slate-300">
              Current: <span className="font-bold text-neon-cyan">{current.toFixed(2)} A</span>
            </p>
            <p className="text-sm text-slate-300">
              Power: <span className="font-bold text-neon-cyan">{power.toFixed(2)} W</span>
            </p>
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
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                particlesRef.current = [];
              }}
              className="w-full py-3 px-4 border border-slate-600 hover:border-neon-cyan rounded-lg transition-colors text-slate-300 hover:text-neon-cyan font-semibold"
            >
              Reset
            </button>
          </div>
        </div>
      }
    >
      <div>
        <h2 className="text-xl font-bold text-neon-cyan mb-4">
          About Electric Circuits
        </h2>
        <p className="text-slate-300 mb-4">
          An electric circuit is a path through which electric current flows.
          This circuit demonstrates Ohm's Law and the relationship between
          voltage, resistance, and current.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Ohm's Law</p>
            <p className="text-slate-400 mt-2">I = U/R</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Power Formula</p>
            <p className="text-slate-400 mt-2">P = U × I</p>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
