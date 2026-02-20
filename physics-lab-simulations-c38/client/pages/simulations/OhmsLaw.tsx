import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

export default function OhmsLaw() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Controls
  const [voltage, setVoltage] = useState(6); // Volts
  const [resistance, setResistance] = useState(3); // Ohms
  const [inputVoltage, setInputVoltage] = useState("6");
  const [inputResistance, setInputResistance] = useState("3");

  const handleCalculate = () => {
    const v = parseFloat(inputVoltage) || 0;
    const r = parseFloat(inputResistance) || 0.5;
    
    if (v > 0 && r > 0) {
      setVoltage(Math.min(12, Math.max(1, v)));
      setResistance(Math.min(10, Math.max(0.5, r)));
    }
  };

  // Calculated current
  const current = voltage / resistance; // Amperes
  const currentSpeed = current * 50; // Speed of electron animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationTime = 0;

    const animate = () => {
      animationTime += 0.03;

      // Clear canvas
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Circuit dimensions
      const startX = 80;
      const startY = 100;
      const width = 600;
      const height = 200;

      // Draw battery
      ctx.fillStyle = "#ff6b6b";
      ctx.fillRect(startX - 30, startY - 10, 15, 60);
      ctx.fillRect(startX - 10, startY - 20, 10, 80);
      ctx.fillStyle = "#ffff00";
      ctx.font = "bold 10px Arial";
      ctx.textAlign = "center";
      ctx.fillText("+", startX - 22, startY + 20);
      ctx.fillText("-", startX - 5, startY + 20);

      // Main circuit path - thick line
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(startX, startY - 30);
      ctx.lineTo(startX + 200, startY - 30);
      ctx.lineTo(startX + 200, startY + 30);
      ctx.lineTo(startX, startY + 30);
      ctx.closePath();
      ctx.stroke();

      // Resistor
      const resistorStartX = startX + 150;
      const resistorY = startY - 30;
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(0, 255, 136, 0.1)";
      ctx.fillRect(resistorStartX - 20, resistorY - 25, 40, 20);
      ctx.strokeRect(resistorStartX - 20, resistorY - 25, 40, 20);
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 11px Arial";
      ctx.textAlign = "center";
      ctx.fillText("R", resistorStartX, resistorY - 15);

      // Draw moving electrons (current visualization)
      const electronCount = Math.max(1, Math.floor(current * 5));
      ctx.fillStyle = "#ffff00";
      ctx.globalAlpha = 0.8;
      
      // Top wire electrons
      for (let i = 0; i < electronCount; i++) {
        const offset = (animationTime * currentSpeed + (i * 200) / electronCount) % 200;
        const x = startX + offset;
        const y = startY - 30;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Right side electrons
      for (let i = 0; i < electronCount; i++) {
        const offset = (animationTime * currentSpeed + (i * 60) / electronCount) % 60;
        const x = startX + 200;
        const y = startY - 30 + offset;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bottom wire electrons
      for (let i = 0; i < electronCount; i++) {
        const offset = (animationTime * currentSpeed + (i * 200) / electronCount) % 200;
        const x = startX + 200 - offset;
        const y = startY + 30;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Left side electrons
      for (let i = 0; i < electronCount; i++) {
        const offset = (animationTime * currentSpeed + (i * 60) / electronCount) % 60;
        const x = startX;
        const y = startY + 30 - offset;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // Labels with values
      ctx.fillStyle = "#ffff00";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";

      ctx.fillText(`U = ${voltage.toFixed(1)} V`, startX - 30, startY - 60);
      ctx.fillText(`R = ${resistance.toFixed(1)} Ω`, startX + 150, startY + 70);
      ctx.fillText(`I = ${current.toFixed(2)} A`, startX + 200 + 50, startY);

      // Draw formula at bottom
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`I = U / R = ${voltage.toFixed(1)} / ${resistance.toFixed(1)} = ${current.toFixed(2)} A`, canvas.width / 2, canvas.height - 30);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [voltage, resistance, current]);

  return (
    <SimulationLayout
      title="Закон Ома - Визуализация"
      canvas={
        <canvas
          ref={canvasRef}
          width={800}
          height={350}
          className="w-full h-full max-w-4xl mx-auto bg-slate-950 rounded-lg"
        />
      }
      controls={
        <div className="space-y-6">
          {/* Voltage Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Напряжение (U), В
            </label>
            <input
              type="number"
              min="1"
              max="12"
              step="0.1"
              value={inputVoltage}
              onChange={(e) => setInputVoltage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-yellow-400"
              placeholder="Введите напряжение"
            />
          </div>

          {/* Resistance Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Сопротивление (R), Ω
            </label>
            <input
              type="number"
              min="0.5"
              max="10"
              step="0.1"
              value={inputResistance}
              onChange={(e) => setInputResistance(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-green-400"
              placeholder="Введите сопротивление"
            />
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Вычислить
          </button>

          {/* Current Display */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-400 mb-3">Ток (I)</p>
            <p className="text-4xl font-bold text-cyan-400">{(voltage / resistance).toFixed(2)} A</p>
            <p className="text-xs text-slate-400 mt-3">Формула: I = U / R</p>
            <p className="font-mono text-sm text-slate-300 mt-2">
              {(voltage / resistance).toFixed(2)} = {voltage.toFixed(1)} / {resistance.toFixed(1)}
            </p>
          </div>
        </div>
      }
    >
      <div className="text-slate-300 text-sm space-y-3">
        <p>
          <span className="font-semibold text-cyan-400">Жёлтые точки</span> на схеме представляют движение электронов. Чем больше ток, тем больше точек и выше их скорость.
        </p>
        <p>
          <span className="font-semibold text-cyan-400">Закон Ома:</span> I = U / R
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Увеличение напряжения → больше тока</li>
          <li>Увеличение сопротивления → меньше тока</li>
        </ul>
      </div>
    </SimulationLayout>
  );
}
