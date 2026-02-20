import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

interface Ray {
  x: number;
  y: number;
  angle: number;
}

export default function LightRefraction() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Controls
  const [incidentAngle, setIncidentAngle] = useState(30);
  const [n1, setN1] = useState(1.0); // Air
  const [n2, setN2] = useState(1.5); // Glass
  const [showNormal, setShowNormal] = useState(true);
  const [showAngles, setShowAngles] = useState(true);

  // Input states for Calculate button
  const [inputIncidentAngle, setInputIncidentAngle] = useState("30");
  const [inputN1, setInputN1] = useState("1.0");
  const [inputN2, setInputN2] = useState("1.5");

  // Handle calculate
  const handleCalculate = () => {
    const angle = parseFloat(inputIncidentAngle);
    const medium1 = parseFloat(inputN1);
    const medium2 = parseFloat(inputN2);

    if (isNaN(angle) || isNaN(medium1) || isNaN(medium2)) {
      alert("Пожалуйста введите корректные числа");
      return;
    }

    if (angle < 0 || angle > 89) {
      alert("Угол падения должен быть от 0 до 89 градусов");
      return;
    }
    if (medium1 < 1 || medium1 > 3) {
      alert("Показатель преломления среды 1 должен быть от 1 до 3");
      return;
    }
    if (medium2 < 1 || medium2 > 3) {
      alert("Показатель преломления среды 2 должен быть от 1 до 3");
      return;
    }

    setIncidentAngle(angle);
    setN1(medium1);
    setN2(medium2);
  };

  // Calculate refraction angle using Snell's law: n1*sin(θ1) = n2*sin(θ2)
  const calculateRefractedAngle = () => {
    const theta1Rad = (incidentAngle * Math.PI) / 180;
    const sinTheta2 = (n1 * Math.sin(theta1Rad)) / n2;

    if (sinTheta2 > 1) {
      // Total internal reflection
      return null;
    }

    const theta2Rad = Math.asin(sinTheta2);
    return (theta2Rad * 180) / Math.PI;
  };

  const refractedAngle = calculateRefractedAngle();
  const isTotalInternalReflection = refractedAngle === null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    const interfaceY = height / 2;
    const interfaceX = width / 2;

    // Clear canvas
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, width, height);

    // Draw media
    // Medium 1 (top)
    ctx.fillStyle = "rgba(100, 150, 255, 0.1)";
    ctx.fillRect(0, 0, width, interfaceY);
    ctx.fillStyle = "rgba(100, 150, 255, 0.05)";
    ctx.font = "12px Inter";
    ctx.fillText(`Medium 1: n = ${n1}`, 20, 30);

    // Medium 2 (bottom)
    ctx.fillStyle = "rgba(255, 150, 100, 0.1)";
    ctx.fillRect(0, interfaceY, width, height);
    ctx.fillStyle = "rgba(255, 150, 100, 0.05)";
    ctx.fillText(`Medium 2: n = ${n2}`, 20, height - 20);

    // Draw interface
    ctx.strokeStyle = "rgba(0, 217, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, interfaceY);
    ctx.lineTo(width, interfaceY);
    ctx.stroke();

    const sourceX = interfaceX;
    const sourceY = interfaceY - 150;

    // Draw normal
    if (showNormal) {
      ctx.strokeStyle = "rgba(200, 200, 200, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(sourceX, 0);
      ctx.lineTo(sourceX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Incident ray
    const theta1Rad = (incidentAngle * Math.PI) / 180;
    const incidentRayLength = 150;
    const incidentEndX = sourceX + incidentRayLength * Math.sin(theta1Rad);
    const incidentEndY = sourceY + incidentRayLength * Math.cos(theta1Rad);

    // Draw incident ray
    ctx.strokeStyle = "rgba(255, 200, 100, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.lineTo(incidentEndX, incidentEndY);
    ctx.stroke();

    // Draw incident point (on interface)
    ctx.fillStyle = "rgba(0, 217, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(sourceX, interfaceY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw refracted or reflected ray
    const rayLength = 150;
    let refractedEndX, refractedEndY;

    if (isTotalInternalReflection) {
      // Total internal reflection
      const reflectedAngle = -incidentAngle;
      const theta3Rad = (reflectedAngle * Math.PI) / 180;
      refractedEndX = sourceX + rayLength * Math.sin(theta3Rad);
      refractedEndY = sourceY + rayLength * Math.cos(theta3Rad);

      ctx.strokeStyle = "rgba(255, 100, 100, 0.8)";
    } else {
      // Refraction
      const theta2Rad = ((refractedAngle || 0) * Math.PI) / 180;
      refractedEndX = sourceX + rayLength * Math.sin(theta2Rad);
      refractedEndY = interfaceY + rayLength * Math.cos(theta2Rad);

      ctx.strokeStyle = "rgba(150, 100, 255, 0.8)";
    }

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sourceX, interfaceY);
    ctx.lineTo(refractedEndX, refractedEndY);
    ctx.stroke();

    // Draw angles
    if (showAngles) {
      ctx.fillStyle = "rgba(255, 200, 100, 0.8)";
      ctx.font = "12px Inter";
      ctx.fillText(`θ₁ = ${incidentAngle}°`, incidentEndX + 10, incidentEndY - 10);

      if (!isTotalInternalReflection && refractedAngle !== undefined) {
        ctx.fillStyle = "rgba(150, 100, 255, 0.8)";
        ctx.fillText(
          `θ₂ = ${refractedAngle.toFixed(1)}°`,
          refractedEndX + 10,
          refractedEndY + 20
        );
      } else if (isTotalInternalReflection) {
        ctx.fillStyle = "rgba(255, 100, 100, 0.8)";
        ctx.fillText(
          `θᵣ = ${incidentAngle}° (ПВО)`,
          refractedEndX + 10,
          refractedEndY + 20
        );
      }
    }

    // Draw critical angle info
    if (n2 < n1) {
      const criticalAngleRad = Math.asin(n2 / n1);
      const criticalAngleDeg = (criticalAngleRad * 180) / Math.PI;
      ctx.fillStyle = "rgba(255, 100, 100, 0.5)";
      ctx.font = "10px Inter";
      ctx.fillText(
        `Critical angle: ${criticalAngleDeg.toFixed(1)}°`,
        20,
        height - 40
      );
    }
  }, [incidentAngle, n1, n2, showNormal, showAngles, isTotalInternalReflection, refractedAngle]);

  return (
    <SimulationLayout
      title="Преломление света - Light Refraction"
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
          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            Рассчитать
          </button>

          {/* Incident Angle */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Угол падения: {incidentAngle}°
            </label>
            <input
              type="number"
              min="0"
              max="89"
              value={inputIncidentAngle}
              onChange={(e) => setInputIncidentAngle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
            <p className="text-xs text-slate-400 mt-1">
              Угол между падающим лучом и нормалью
            </p>
          </div>

          {/* Medium 1 Refractive Index */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              n₁ (Среда 1): {n1.toFixed(2)}
            </label>
            <input
              type="number"
              min="1"
              max="3"
              step="0.1"
              value={inputN1}
              onChange={(e) => setInputN1(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
            <p className="text-xs text-slate-400 mt-1">Показатель преломления среды 1</p>
          </div>

          {/* Medium 2 Refractive Index */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              n₂ (Среда 2): {n2.toFixed(2)}
            </label>
            <input
              type="number"
              min="1"
              max="3"
              step="0.1"
              value={inputN2}
              onChange={(e) => setInputN2(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
            <p className="text-xs text-slate-400 mt-1">Показатель преломления среды 2</p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showNormal}
                onChange={(e) => setShowNormal(e.target.checked)}
                className="w-4 h-4 accent-neon-cyan"
              />
              <span className="text-sm text-slate-300">Показать нормаль</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAngles}
                onChange={(e) => setShowAngles(e.target.checked)}
                className="w-4 h-4 accent-neon-cyan"
              />
              <span className="text-sm text-slate-300">Показать углы</span>
            </label>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neon-cyan mb-4">
            Закон преломления Снелла
          </h2>
          <p className="text-slate-300 mb-4">
            Когда свет переходит из одной прозрачной среды в другую, его направление
            изменяется в соответствии с законом Снелла. Эта симуляция показывает,
            как свет преломляется при прохождении через границу раздела двух сред.
          </p>
        </div>

        {/* Snell's Law Formula */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <p className="font-semibold text-neon-cyan mb-2">Закон Снелла</p>
          <p className="text-slate-400 font-mono mb-2">n₁ sin(θ₁) = n₂ sin(θ₂)</p>
          <p className="text-xs text-slate-500">
            где n - показатель преломления, θ - угол падения/преломления
          </p>
        </div>

        {/* Results */}
        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-neon-cyan mb-3">Результаты</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
              <span className="text-slate-400">Угол падения:</span>
              <span className="text-neon-amber font-mono">{incidentAngle}°</span>
            </div>
            {isTotalInternalReflection ? (
              <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-red-500/30">
                <span className="text-slate-400">Полное внутреннее отражение:</span>
                <span className="text-red-400 font-mono">Да</span>
              </div>
            ) : (
              <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
                <span className="text-slate-400">Угол преломления:</span>
                <span className="text-neon-cyan font-mono">
                  {refractedAngle?.toFixed(2) || "—"}°
                </span>
              </div>
            )}
            <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
              <span className="text-slate-400">Соотношение n₂/n₁:</span>
              <span className="text-slate-300 font-mono">{(n2 / n1).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Common Values */}
        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700 text-sm">
          <h3 className="font-semibold text-neon-cyan mb-2">Показатели преломления</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>Вакуум: n = 1.0</div>
            <div>Воздух: n = 1.00</div>
            <div>Вода: n = 1.33</div>
            <div>Стекло: n = 1.5</div>
            <div>Алмаз: n = 2.42</div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
