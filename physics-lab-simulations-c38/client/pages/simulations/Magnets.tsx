import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

interface Magnet {
  x: number;
  y: number;
  polarity: "N" | "S";
  strength: number;
}

export default function Magnets() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Controls
  const [magnet1Strength, setMagnet1Strength] = useState(1);
  const [magnet2Strength, setMagnet2Strength] = useState(1);
  const [magnet2Polarity, setMagnet2Polarity] = useState<"N" | "S">("S");
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showForce, setShowForce] = useState(true);
  const [fieldDensity, setFieldDensity] = useState(10);

  // Input fields
  const [inputMagnet1Strength, setInputMagnet1Strength] = useState("1");
  const [inputMagnet2Strength, setInputMagnet2Strength] = useState("1");
  const [inputFieldDensity, setInputFieldDensity] = useState("10");

  const handleCalculate = () => {
    const m1 = parseFloat(inputMagnet1Strength) || 1;
    const m2 = parseFloat(inputMagnet2Strength) || 1;
    const fd = parseFloat(inputFieldDensity) || 10;
    
    setMagnet1Strength(Math.min(3, Math.max(0.5, m1)));
    setMagnet2Strength(Math.min(3, Math.max(0.5, m2)));
    setFieldDensity(Math.min(25, Math.max(5, fd)));
  };

  const magnets: Magnet[] = [
    { x: 150, y: 250, polarity: "N", strength: magnet1Strength },
    { x: 450, y: 250, polarity: magnet2Polarity, strength: magnet2Strength },
  ];

  // Calculate magnetic force between two magnets
  const calculateForce = () => {
    const dx = magnets[1].x - magnets[0].x;
    const distance = Math.abs(dx);

    // F = k * (m1 * m2) / r²
    // k is a constant for visualization
    const k = 50000;
    const force =
      (k * magnet1Strength * magnet2Strength) / (distance * distance);

    const isRepulsive = magnets[0].polarity === magnets[1].polarity;

    return { force, isRepulsive, distance };
  };

  const { force, isRepulsive, distance: magDist } = calculateForce();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "rgba(0, 217, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    // Draw magnetic field lines
    if (showFieldLines) {
      const step = Math.max(5, 20 - fieldDensity);
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          // Calculate field strength from both magnets
          const field1 = calculateFieldPoint(x, y, magnets[0]);
          const field2 = calculateFieldPoint(x, y, magnets[1]);

          const totalFieldX = field1.x + field2.x;
          const totalFieldY = field1.y + field2.y;

          const strength = Math.sqrt(totalFieldX ** 2 + totalFieldY ** 2);

          if (strength > 0.01) {
            const length = Math.min(strength * 3, 15);
            const angle = Math.atan2(totalFieldY, totalFieldX);

            // Color based on field strength
            const hue = isRepulsive ? 0 : 120;
            const saturation = Math.min(strength * 50, 100);
            ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 50%, ${Math.min(
              strength * 0.5,
              0.3
            )})`;
            ctx.lineWidth = strength * 2;

            const endX = x + length * Math.cos(angle);
            const endY = y + length * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }
        }
      }
    }

    // Draw magnets
    magnets.forEach((magnet) => {
      const magnetWidth = 40 + magnet.strength * 20;
      const magnetHeight = 60 + magnet.strength * 20;

      // Magnet body
      ctx.fillStyle = magnet.polarity === "N" ? "rgba(100, 150, 255, 0.3)" : "rgba(255, 150, 100, 0.3)";
      ctx.strokeStyle =
        magnet.polarity === "N"
          ? "rgba(100, 150, 255, 0.8)"
          : "rgba(255, 150, 100, 0.8)";
      ctx.lineWidth = 2;
      ctx.fillRect(
        magnet.x - magnetWidth / 2,
        magnet.y - magnetHeight / 2,
        magnetWidth,
        magnetHeight
      );
      ctx.strokeRect(
        magnet.x - magnetWidth / 2,
        magnet.y - magnetHeight / 2,
        magnetWidth,
        magnetHeight
      );

      // Polarity label
      ctx.fillStyle = magnet.polarity === "N" ? "#6496ff" : "#ff9664";
      ctx.font = "bold 24px Inter";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(magnet.polarity, magnet.x, magnet.y);

      // Magnetic strength indicator
      ctx.fillStyle = "rgba(200, 200, 200, 0.6)";
      ctx.font = "12px Inter";
      ctx.textAlign = "center";
      ctx.fillText(`${magnet.strength.toFixed(1)}`, magnet.x, magnet.y + magnetHeight / 2 + 20);
    });

    // Draw force arrow if showing force
    if (showForce && magDist > 50) {
      const arrowStartX = magnets[0].x + 30;
      const arrowEndX = magnets[1].x - 30;
      const arrowY = 120;

      // Force line
      ctx.strokeStyle = isRepulsive
        ? "rgba(255, 100, 100, 0.8)"
        : "rgba(100, 255, 100, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowY);
      ctx.lineTo(arrowEndX, arrowY);
      ctx.stroke();

      // Arrow heads
      const arrowSize = 10;
      const leftArrowX = isRepulsive ? arrowEndX : arrowStartX;
      const rightArrowX = isRepulsive ? arrowStartX : arrowEndX;

      // Left arrow
      ctx.beginPath();
      ctx.moveTo(leftArrowX, arrowY);
      ctx.lineTo(leftArrowX + arrowSize, arrowY - arrowSize);
      ctx.lineTo(leftArrowX + arrowSize, arrowY + arrowSize);
      ctx.closePath();
      ctx.fill();

      // Right arrow
      ctx.beginPath();
      ctx.moveTo(rightArrowX, arrowY);
      ctx.lineTo(rightArrowX - arrowSize, arrowY - arrowSize);
      ctx.lineTo(rightArrowX - arrowSize, arrowY + arrowSize);
      ctx.closePath();
      ctx.fill();

      // Force label
      ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
      ctx.font = "12px Inter";
      ctx.textAlign = "center";
      const forceLabel = isRepulsive ? "Отталкивание" : "Притяжение";
      ctx.fillText(forceLabel, (arrowStartX + arrowEndX) / 2, arrowY - 30);
    }

    // Draw info text
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "12px Inter";
    ctx.textAlign = "left";
    ctx.fillText(`Магнит 1 (N): ${magnet1Strength.toFixed(1)}`, 20, 25);
    ctx.fillText(`Магнит 2 (${magnet2Polarity}): ${magnet2Strength.toFixed(1)}`, 20, 45);
    ctx.fillText(`Расстояние: ${magDist.toFixed(0)}px`, 20, 65);
    ctx.fillText(`Сила: ${force.toFixed(2)} N (относит.)`, 20, 85);
  }, [magnet1Strength, magnet2Strength, magnet2Polarity, showFieldLines, showForce, fieldDensity]);

  const calculateFieldPoint = (x: number, y: number, magnet: Magnet) => {
    const dx = x - magnet.x;
    const dy = y - magnet.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq < 100) return { x: 0, y: 0 };

    const distance = Math.sqrt(distanceSq);
    const poleFactor = magnet.polarity === "N" ? 1 : -1;

    const magnitude =
      (magnet.strength * poleFactor * 1000) / (distanceSq * distanceSq);

    return {
      x: (magnitude * dx) / distance,
      y: (magnitude * dy) / distance,
    };
  };

  return (
    <SimulationLayout
      title="Магниты и электромагниты - Magnets & Electromagnets"
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
          {/* Magnet 1 Strength */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Магнит 1 (N) - сила
            </label>
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              value={inputMagnet1Strength}
              onChange={(e) => setInputMagnet1Strength(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
              placeholder="Введите силу"
            />
          </div>

          {/* Magnet 2 Polarity */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Полюс магнита 2
            </label>
            <select
              value={magnet2Polarity}
              onChange={(e) => setMagnet2Polarity(e.target.value as "N" | "S")}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="N">N (Северный)</option>
              <option value="S">S (Южный)</option>
            </select>
          </div>

          {/* Magnet 2 Strength */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Магнит 2 ({magnet2Polarity}) - сила
            </label>
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              value={inputMagnet2Strength}
              onChange={(e) => setInputMagnet2Strength(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
              placeholder="Введите силу"
            />
          </div>

          {/* Field Density */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Плотность силовых линий
            </label>
            <input
              type="number"
              min="5"
              max="25"
              step="1"
              value={inputFieldDensity}
              onChange={(e) => setInputFieldDensity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
              placeholder="Введите плотность"
            />
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Рассчитать
          </button>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFieldLines}
                onChange={(e) => setShowFieldLines(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              <span className="text-sm text-slate-300">Показать силовые линии</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showForce}
                onChange={(e) => setShowForce(e.target.checked)}
                className="w-4 h-4 accent-neon-cyan"
              />
              <span className="text-sm text-slate-300">Показать силу взаимодействия</span>
            </label>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neon-cyan mb-4">
            Магнитные поля и взаимодействие
          </h2>
          <p className="text-slate-300 mb-4">
            Магниты создают магнитные поля, которые видны как силовые линии. Два магнита
            будут притягиваться, если их полюса противоположны, и отталкиваться, если они
            одинаковые.
          </p>
        </div>

        {/* Force Law */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <p className="font-semibold text-neon-cyan mb-2">Закон магнитного взаимодействия</p>
          <p className="text-slate-400 font-mono mb-2">F = k·(m₁·m₂) / r²</p>
          <p className="text-xs text-slate-500">
            F - сила, k - константа, m₁ и m₂ - магнитные моменты, r - расстояние
          </p>
        </div>

        {/* Magnetic Field */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <p className="font-semibold text-neon-cyan mb-2">Магнитное поле</p>
          <p className="text-slate-400 text-sm">
            Величина и направление магнитного поля показаны стрелками. Линии всегда выходят
            из северного полюса (N) и входят в южный полюс (S).
          </p>
        </div>

        {/* Interaction Rules */}
        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-neon-cyan mb-3">Правила взаимодействия</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="text-neon-cyan">→</span>
              <span>N-N или S-S: Отталкивание</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-neon-amber">→</span>
              <span>N-S: Притяжение</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-neon-cyan">→</span>
              <span>Сила обратно пропорциональна квадрату расстояния</span>
            </div>
          </div>
        </div>

        {/* Current Measurements */}
        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-neon-cyan mb-3">Текущие параметры</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
              <span className="text-slate-400">Расстояние между магнитами:</span>
              <span className="text-neon-cyan font-mono">{magDist.toFixed(0)} px</span>
            </div>
            <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
              <span className="text-slate-400">Сила взаимодействия:</span>
              <span className="text-neon-cyan font-mono">{force.toFixed(3)} N</span>
            </div>
            <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
              <span className="text-slate-400">Взаимодействие:</span>
              <span className={`font-mono ${isRepulsive ? "text-red-400" : "text-green-400"}`}>
                {isRepulsive ? "Отталкивание" : "Притяжение"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
