import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

export default function HydrogenAtom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Controls
  const [model, setModel] = useState<"bohr" | "quantum">("bohr");
  const [energyLevel, setEnergyLevel] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);

  // Input states for Calculate button
  const [inputEnergyLevel, setInputEnergyLevel] = useState("1");

  // Handle calculate
  const handleCalculate = () => {
    const level = parseInt(inputEnergyLevel);

    if (isNaN(level)) {
      alert("Пожалуйста введите корректное целое число");
      return;
    }

    if (level < 1 || level > 4) {
      alert("Энергетический уровень должен быть от 1 до 4");
      return;
    }

    setEnergyLevel(level);
  };

  // Bohr model: electron orbital radii (in arbitrary units)
  const bohrRadii = {
    1: 50,
    2: 200,
    3: 450,
    4: 800,
  };

  const currentRadius = bohrRadii[energyLevel as keyof typeof bohrRadii] || 50;

  // Energy calculation: E_n = -13.6 eV / n²
  const energy = (-13.6 / (energyLevel * energyLevel)).toFixed(2);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationTime = 0;

    const animate = () => {
      if (isAnimating) {
        animationTime += 0.016;
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

      // Center of canvas
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2.5;

      if (model === "bohr") {
        // Draw Bohr model
        // Draw nucleus (proton)
        ctx.fillStyle = "rgba(255, 181, 0, 0.9)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Glow around nucleus
        ctx.fillStyle = "rgba(255, 181, 0, 0.2)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw orbital shells (first 4 shells)
        for (let level = 1; level <= 4; level++) {
          const radius = bohrRadii[level as keyof typeof bohrRadii];
          ctx.strokeStyle =
            level === energyLevel
              ? "rgba(0, 217, 255, 0.8)"
              : "rgba(0, 217, 255, 0.3)";
          ctx.lineWidth = level === energyLevel ? 3 : 1;
          ctx.setLineDash(level === energyLevel ? [] : [5, 5]);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw shell label
          ctx.fillStyle = `rgba(0, 217, 255, ${level === energyLevel ? 0.9 : 0.5})`;
          ctx.font = "11px Inter";
          ctx.textAlign = "center";
          ctx.fillText(`n=${level}`, centerX + radius + 5, centerY - 5);
        }

        // Draw electron on current orbital
        const electronAngle = animationTime * (1 / (energyLevel * energyLevel));
        const electronX =
          centerX + currentRadius * Math.cos(electronAngle);
        const electronY =
          centerY + currentRadius * Math.sin(electronAngle);

        ctx.fillStyle = "rgba(0, 217, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(electronX, electronY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Electron glow
        ctx.fillStyle = "rgba(0, 217, 255, 0.3)";
        ctx.beginPath();
        ctx.arc(electronX, electronY, 10, 0, Math.PI * 2);
        ctx.fill();

        // Draw electron trail
        ctx.strokeStyle = "rgba(0, 217, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 50; i++) {
          const angle = electronAngle - (i * 0.1);
          const x = centerX + currentRadius * Math.cos(angle);
          const y = centerY + currentRadius * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      } else {
        // Draw quantum mechanical model (probability cloud)
        // Draw nucleus
        ctx.fillStyle = "rgba(255, 181, 0, 0.9)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Draw probability density (electron cloud)
        const cloudSize = currentRadius;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
          for (let r = 10; r <= cloudSize; r += 20) {
            const opacity = Math.max(0, 1 - (r - cloudSize / 2) / (cloudSize / 2));
            const jitter = Math.sin(animationTime * 2 + angle + r * 0.01) * 10;

            ctx.fillStyle = `rgba(0, 217, 255, ${opacity * 0.3})`;
            ctx.beginPath();
            ctx.arc(
              centerX + (r + jitter) * Math.cos(angle),
              centerY + (r + jitter) * Math.sin(angle),
              15,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        // Draw orbital boundary
        ctx.strokeStyle = "rgba(0, 217, 255, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, cloudSize * 0.9, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw info panel
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(20, canvas.height - 110, canvas.width - 40, 100);
      ctx.strokeStyle = "rgba(0, 217, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(20, canvas.height - 110, canvas.width - 40, 100);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "13px Inter";
      ctx.textAlign = "left";
      ctx.fillText(
        `Model: ${model === "bohr" ? "Bohr Model" : "Quantum Mechanical"}`,
        30,
        canvas.height - 85
      );
      ctx.fillText(`Energy Level (n): ${energyLevel}`, 30, canvas.height - 60);
      ctx.fillText(
        `Energy: ${energy} eV`,
        30,
        canvas.height - 35
      );
      ctx.fillStyle = "rgba(255, 181, 0, 0.9)";
      ctx.font = "12px Inter";
      ctx.fillText(
        `E_n = -13.6 eV / n² = ${energy} eV`,
        canvas.width - 250,
        canvas.height - 35
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [model, energyLevel, currentRadius, energy, isAnimating]);

  return (
    <SimulationLayout
      title="Модели атома водорода - Hydrogen Atom Models"
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
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Atomic Model
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setModel("bohr")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  model === "bohr"
                    ? "bg-neon-cyan text-slate-900"
                    : "bg-slate-800 text-slate-300 border border-slate-600 hover:border-neon-cyan"
                }`}
              >
                Bohr
              </button>
              <button
                onClick={() => setModel("quantum")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  model === "quantum"
                    ? "bg-neon-cyan text-slate-900"
                    : "bg-slate-800 text-slate-300 border border-slate-600 hover:border-neon-cyan"
                }`}
              >
                Quantum
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {model === "bohr"
                ? "Classical orbital model with discrete electron shells"
                : "Probability density distribution of electron"}
            </p>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            Рассчитать
          </button>

          {/* Energy Level Control */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Energy Level (n): {energyLevel}
            </label>
            <input
              type="number"
              min="1"
              max="4"
              value={inputEnergyLevel}
              onChange={(e) => setInputEnergyLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
            <p className="text-xs text-slate-400 mt-1">
              Principal quantum number
            </p>
          </div>

          {/* Animation Toggle */}
          <div>
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                isAnimating
                  ? "bg-neon-cyan text-slate-900"
                  : "bg-slate-800 text-slate-300 border border-slate-600"
              }`}
            >
              {isAnimating ? "✓ Animation On" : "Animation Off"}
            </button>
          </div>

          {/* Energy Display */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3">
            <div>
              <p className="text-sm text-slate-400 mb-1">Energy</p>
              <p className="text-2xl font-bold text-neon-cyan">{energy} eV</p>
            </div>
            <div className="pt-3 border-t border-slate-600 space-y-2">
              <p className="text-xs text-slate-400">Formula:</p>
              <p className="font-mono text-sm text-slate-300">E_n = -13.6 / n²</p>
              <p className="font-mono text-sm text-neon-cyan">{energy} = -13.6 / {energyLevel}²</p>
            </div>
          </div>

          {/* Orbital Radius (Bohr only) */}
          {model === "bohr" && (
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-400 mb-1">Orbital Radius</p>
              <p className="text-lg font-bold text-neon-cyan">
                {(0.53 * energyLevel * energyLevel).toFixed(2)} pm
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Bohr radius × n²
              </p>
            </div>
          )}
        </div>
      }
    >
      <div>
        <h2 className="text-xl font-bold text-neon-cyan mb-4">
          About Hydrogen Atom Models
        </h2>
        <p className="text-slate-300 mb-4">
          The hydrogen atom has been described by different models throughout
          history. The Bohr model uses classical orbits, while the quantum
          mechanical model describes electron probability distributions.
        </p>
        <div className="grid grid-cols-1 gap-4 mt-4 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan mb-2">Bohr Model:</p>
            <p className="text-slate-400 text-xs mb-2">
              • Electrons orbit nucleus in discrete shells
            </p>
            <p className="text-slate-400 text-xs">
              • Radius: a₀ × n² (Bohr radius = 0.53 Å)
            </p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan mb-2">Energy Levels:</p>
            <p className="text-slate-400 font-mono text-xs mb-2">
              E_n = -13.6 eV / n²
            </p>
            <p className="text-slate-400 text-xs">
              • n=1: -13.6 eV (ground state)
            </p>
            <p className="text-slate-400 text-xs">
              • n=2: -3.4 eV (first excited)
            </p>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
