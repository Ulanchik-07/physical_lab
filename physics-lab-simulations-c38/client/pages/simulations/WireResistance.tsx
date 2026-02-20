import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

export default function WireResistance() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Controls
  const [length, setLength] = useState(10); // meters
  const [diameter, setDiameter] = useState(2); // mm
  const [material, setMaterial] = useState<"copper" | "aluminum" | "constantan">(
    "copper"
  );

  // Input fields
  const [inputLength, setInputLength] = useState("10");
  const [inputDiameter, setInputDiameter] = useState("2");

  const handleCalculate = () => {
    const l = parseFloat(inputLength) || 10;
    const d = parseFloat(inputDiameter) || 2;
    
    setLength(Math.min(100, Math.max(1, l)));
    setDiameter(Math.min(10, Math.max(0.5, d)));
  };

  // Material resistivity values in ohm·mm²/m
  const resistivity: Record<string, number> = {
    copper: 0.0172,
    aluminum: 0.0265,
    constantan: 0.49,
  };

  const rho = resistivity[material];

  // Calculate resistance: R = ρ * L / A
  // A = π * (d/2)² = π * (d²/4)
  const radius = diameter / 2;
  const crossSectionArea = Math.PI * radius * radius; // mm²
  const resistance = (rho * length) / crossSectionArea; // Ohms

  // Animation loop for visualization
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
      ctx.fillText("Wire Resistance Calculator", canvas.width / 2, 40);
      ctx.font = "14px Inter";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText("R = ρ × L / A", canvas.width / 2, 65);

      // Draw wire visualization
      const wireStartX = 100;
      const wireStartY = 150;
      const wireLength = 300;
      const wireHeight = Math.min(diameter * 3, 40);

      // Wire body
      ctx.fillStyle = `rgba(0, 217, 255, 0.3)`;
      ctx.fillRect(wireStartX, wireStartY - wireHeight / 2, wireLength, wireHeight);

      // Wire border
      ctx.strokeStyle = "rgba(0, 217, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        wireStartX,
        wireStartY - wireHeight / 2,
        wireLength,
        wireHeight
      );

      // Draw length indicator
      ctx.strokeStyle = "rgba(255, 181, 0, 0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(wireStartX, wireStartY + wireHeight / 2 + 20);
      ctx.lineTo(wireStartX + wireLength, wireStartY + wireHeight / 2 + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Length label
      ctx.fillStyle = "rgba(255, 181, 0, 0.8)";
      ctx.font = "12px Inter";
      ctx.textAlign = "center";
      ctx.fillText(`L = ${length} m`, wireStartX + wireLength / 2, wireStartY + wireHeight / 2 + 40);

      // Draw diameter indicator
      ctx.strokeStyle = "rgba(0, 217, 255, 0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(wireStartX - 20, wireStartY - wireHeight / 2);
      ctx.lineTo(wireStartX - 20, wireStartY + wireHeight / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Diameter label
      ctx.fillStyle = "rgba(0, 217, 255, 0.8)";
      ctx.fillText(`d = ${diameter} mm`, wireStartX - 50, wireStartY);

      // Draw material indicator with color
      const materialColors: Record<string, string> = {
        copper: "#FF8C00",
        aluminum: "#C0C0C0",
        constantan: "#A0522D",
      };
      ctx.fillStyle = materialColors[material];
      ctx.globalAlpha = 0.6;
      ctx.fillRect(wireStartX, wireStartY - wireHeight / 2, wireLength, wireHeight);
      ctx.globalAlpha = 1;

      // Calculations panel
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(50, 240, 400, 140);
      ctx.strokeStyle = "rgba(0, 217, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(50, 240, 400, 140);

      // Calculation text
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "12px Inter";
      ctx.textAlign = "left";
      ctx.fillText(`Material: ${material.charAt(0).toUpperCase() + material.slice(1)}`, 60, 260);
      ctx.fillText(`Resistivity (ρ): ${rho.toFixed(4)} Ω·mm²/m`, 60, 280);
      ctx.fillText(`Length (L): ${length} m`, 60, 300);
      ctx.fillText(`Cross-section Area (A): ${crossSectionArea.toFixed(2)} mm²`, 60, 320);
      ctx.fillText(`Resistance (R): ${resistance.toFixed(4)} Ω`, 60, 340);
      ctx.fillStyle = "rgba(255, 181, 0, 0.9)";
      ctx.font = "bold 14px Inter";
      ctx.fillText(`Formula: R = ${rho.toFixed(4)} × ${length} / ${crossSectionArea.toFixed(2)} = ${resistance.toFixed(4)} Ω`, 60, 365);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [length, diameter, material, rho, crossSectionArea, resistance]);

  return (
    <SimulationLayout
      title="Сопротивление в проводе - Wire Resistance"
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
          {/* Material Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Material
            </label>
            <select
              value={material}
              onChange={(e) =>
                setMaterial(e.target.value as "copper" | "aluminum" | "constantan")
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 hover:border-neon-cyan focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-colors"
            >
              <option value="copper">Copper (Cu)</option>
              <option value="aluminum">Aluminum (Al)</option>
              <option value="constantan">Constantan (CuNi)</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Resistivity: {rho.toFixed(4)} Ω·mm²/m
            </p>
          </div>

          {/* Length Control */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Длина (L), м
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              value={inputLength}
              onChange={(e) => setInputLength(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
              placeholder="Введите длину"
            />
          </div>

          {/* Diameter Control */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Диаметр (d), мм
            </label>
            <input
              type="number"
              min="0.5"
              max="10"
              step="0.1"
              value={inputDiameter}
              onChange={(e) => setInputDiameter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
              placeholder="Введите диаметр"
            />
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Рассчитать
          </button>

          {/* Result Display */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3">
            <div>
              <p className="text-sm text-slate-400 mb-1">Resistance</p>
              <p className="text-2xl font-bold text-neon-cyan">
                {resistance.toFixed(4)} Ω
              </p>
            </div>
            <div className="pt-3 border-t border-slate-600 space-y-2">
              <p className="text-xs text-slate-400">Area: {crossSectionArea.toFixed(2)} mm²</p>
              <p className="text-xs text-slate-400">
                Formula: R = ρ·L/A
              </p>
            </div>
          </div>

          {/* Quick Tests */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-300">Quick Tests:</p>
            <button
              onClick={() => {
                setMaterial("copper");
                setLength(10);
                setDiameter(2);
              }}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
            >
              Standard Copper Wire
            </button>
          </div>
        </div>
      }
    >
      <div>
        <h2 className="text-xl font-bold text-neon-cyan mb-4">
          About Wire Resistance
        </h2>
        <p className="text-slate-300 mb-4">
          The resistance of a wire depends on its material (resistivity), length,
          and cross-sectional area. Longer wires have more resistance, while
          thicker wires have less resistance.
        </p>
        <div className="grid grid-cols-1 gap-4 mt-4 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan mb-2">Resistance Formula:</p>
            <p className="text-slate-400 font-mono">R = ρ × L / A</p>
            <ul className="text-slate-400 mt-2 text-xs space-y-1">
              <li>• ρ (rho) = Resistivity of material</li>
              <li>• L = Length of the wire</li>
              <li>• A = Cross-sectional area</li>
            </ul>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan mb-2">Key Facts:</p>
            <ul className="text-slate-400 text-xs space-y-1">
              <li>• Longer wire = Higher resistance</li>
              <li>• Thicker wire = Lower resistance</li>
              <li>• Different materials have different resistivity</li>
            </ul>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
