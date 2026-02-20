import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

type LensType = "convex" | "concave" | "flat";
type OpticalElement = "lens" | "mirror";

export default function GeometricOptics() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Controls
  const [opticalElement, setOpticalElement] = useState<OpticalElement>("lens");
  const [lensType, setLensType] = useState<LensType>("convex");
  const [focalLength, setFocalLength] = useState(100);
  const [objectDistance, setObjectDistance] = useState(150);
  const [objectHeight, setObjectHeight] = useState(30);
  const [showRays, setShowRays] = useState(true);
  const [showFocusPoints, setShowFocusPoints] = useState(true);

  // Input states for Calculate button
  const [inputFocalLength, setInputFocalLength] = useState("100");
  const [inputObjectDistance, setInputObjectDistance] = useState("150");
  const [inputObjectHeight, setInputObjectHeight] = useState("30");

  // Handle calculate
  const handleCalculate = () => {
    const focal = parseFloat(inputFocalLength);
    const objDist = parseFloat(inputObjectDistance);
    const objHeight = parseFloat(inputObjectHeight);

    if (isNaN(focal) || isNaN(objDist) || isNaN(objHeight)) {
      alert("Пожалуйста введите корректные числа");
      return;
    }

    if (focal < 10 || focal > 200) {
      alert("Фокусное расстояние должно быть от 10 до 200");
      return;
    }
    if (objDist < 30 || objDist > 400) {
      alert("Расстояние объекта должно быть от 30 до 400");
      return;
    }
    if (objHeight < 10 || objHeight > 50) {
      alert("Высота объекта должна быть от 10 до 50");
      return;
    }

    setFocalLength(focal);
    setObjectDistance(objDist);
    setObjectHeight(objHeight);
  };

  // Calculate image properties using lens equation: 1/f = 1/d_o + 1/d_i
  const calculateImageProperties = () => {
    if (objectDistance <= 0 || focalLength === 0) {
      return { imageDistance: null, magnification: null, isReal: false };
    }

    // 1/d_i = 1/f - 1/d_o
    const reciprocalImageDistance = 1 / focalLength - 1 / objectDistance;

    if (reciprocalImageDistance === 0) {
      return { imageDistance: Infinity, magnification: Infinity, isReal: false };
    }

    const d_i = 1 / reciprocalImageDistance;
    const magnification = -d_i / objectDistance;

    return {
      imageDistance: d_i,
      magnification: magnification,
      isReal: d_i > 0 && focalLength > 0,
    };
  };

  const imageProps = calculateImageProperties();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 0.5; // pixels per unit

    // Clear canvas
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, width, height);

    // Draw optical axis
    ctx.strokeStyle = "rgba(0, 217, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw lens/mirror
    const opticalCenterX = centerX;
    const opticalCenterY = centerY;
    const lensHeight = 100;

    if (opticalElement === "lens") {
      // Draw lens
      ctx.strokeStyle = "rgba(100, 150, 255, 0.8)";
      ctx.lineWidth = 3;

      if (lensType === "convex") {
        // Convex lens (converging)
        ctx.beginPath();
        ctx.arc(opticalCenterX - 5, opticalCenterY, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(opticalCenterX + 5, opticalCenterY, 8, 0, Math.PI * 2);
        ctx.stroke();
      } else if (lensType === "concave") {
        // Concave lens (diverging)
        ctx.beginPath();
        ctx.moveTo(opticalCenterX, opticalCenterY - lensHeight / 2);
        ctx.lineTo(opticalCenterX + 15, opticalCenterY);
        ctx.lineTo(opticalCenterX, opticalCenterY + lensHeight / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(opticalCenterX, opticalCenterY - lensHeight / 2);
        ctx.lineTo(opticalCenterX - 15, opticalCenterY);
        ctx.lineTo(opticalCenterX, opticalCenterY + lensHeight / 2);
        ctx.stroke();
      }
    } else {
      // Draw mirror
      ctx.strokeStyle = "rgba(255, 150, 100, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(opticalCenterX, opticalCenterY - lensHeight / 2);
      ctx.lineTo(opticalCenterX, opticalCenterY + lensHeight / 2);
      ctx.stroke();
    }

    // Draw focal points
    if (showFocusPoints) {
      ctx.fillStyle = "rgba(255, 200, 100, 0.6)";
      const focalDist = focalLength * scale;

      // Front focal point
      ctx.beginPath();
      ctx.arc(opticalCenterX - focalDist, opticalCenterY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Back focal point (only for lenses)
      if (opticalElement === "lens") {
        if ((lensType === "convex" && focalLength > 0) || (lensType === "concave" && focalLength < 0)) {
          ctx.beginPath();
          ctx.arc(opticalCenterX + focalDist, opticalCenterY, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Label focal points
      ctx.fillStyle = "rgba(255, 200, 100, 0.8)";
      ctx.font = "10px Inter";
      ctx.fillText("f", opticalCenterX - focalDist - 10, opticalCenterY - 15);
    }

    // Draw object
    const objX = centerX - objectDistance * scale;
    const objHeight = objectHeight || 30;

    ctx.strokeStyle = "rgba(0, 217, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(objX, centerY);
    ctx.lineTo(objX, centerY - objHeight);
    ctx.stroke();

    // Object point
    ctx.fillStyle = "rgba(0, 217, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(objX, centerY - objHeight, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw rays if applicable
    if (showRays && imageProps.imageDistance !== null && imageProps.imageDistance !== Infinity) {
      const imgX = centerX + imageProps.imageDistance * scale;
      const imgHeight = objectHeight * (imageProps.magnification || 0);

      // Draw image
      ctx.strokeStyle = imageProps.isReal ? "rgba(150, 100, 255, 0.8)" : "rgba(100, 100, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.setLineDash(imageProps.isReal ? [] : [5, 5]);
      ctx.beginPath();
      ctx.moveTo(imgX, centerY);
      ctx.lineTo(imgX, centerY - imgHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Image point
      ctx.fillStyle = imageProps.isReal ? "rgba(150, 100, 255, 0.8)" : "rgba(100, 100, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(imgX, centerY - imgHeight, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw some ray paths
      ctx.strokeStyle = "rgba(255, 150, 100, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // Central ray
      ctx.beginPath();
      ctx.moveTo(objX, centerY - objHeight);
      ctx.lineTo(imgX, centerY - imgHeight);
      ctx.stroke();

      ctx.setLineDash([]);
    }

    // Draw labels
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "12px Inter";
    ctx.fillText(`Object`, objX - 20, centerY + 25);

    if (imageProps.imageDistance !== null && imageProps.imageDistance !== Infinity) {
      const imgX = centerX + imageProps.imageDistance * scale;
      const label = imageProps.isReal ? "Real Image" : "Virtual Image";
      ctx.fillStyle = imageProps.isReal ? "rgba(150, 100, 255, 0.8)" : "rgba(100, 100, 255, 0.6)";
      ctx.fillText(label, imgX - 30, centerY + 25);
    }
  }, [opticalElement, lensType, focalLength, objectDistance, objectHeight, showRays, showFocusPoints, imageProps]);

  return (
    <SimulationLayout
      title="Геометрическая оптика - Geometric Optics"
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

          {/* Optical Element */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Оптический элемент
            </label>
            <select
              value={opticalElement}
              onChange={(e) => setOpticalElement(e.target.value as OpticalElement)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
            >
              <option value="lens">Линза</option>
              <option value="mirror">Зеркало</option>
            </select>
          </div>

          {/* Lens Type */}
          {opticalElement === "lens" && (
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Тип линзы
              </label>
              <select
                value={lensType}
                onChange={(e) => setLensType(e.target.value as LensType)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200"
              >
                <option value="convex">Выпуклая (собирающая)</option>
                <option value="concave">Вогнутая (рассеивающая)</option>
                <option value="flat">Плоская</option>
              </select>
            </div>
          )}

          {/* Focal Length */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Фокусное расстояние: {focalLength}
            </label>
            <input
              type="number"
              min="10"
              max="200"
              value={inputFocalLength}
              onChange={(e) => setInputFocalLength(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
            <p className="text-xs text-slate-400 mt-1">Расстояние до фокуса</p>
          </div>

          {/* Object Distance */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Расстояние объекта: {objectDistance}
            </label>
            <input
              type="number"
              min="30"
              max="400"
              value={inputObjectDistance}
              onChange={(e) => setInputObjectDistance(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
            <p className="text-xs text-slate-400 mt-1">Расстояние от объекта до линзы</p>
          </div>

          {/* Object Height */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Высота объекта: {objectHeight}
            </label>
            <input
              type="number"
              min="10"
              max="50"
              value={inputObjectHeight}
              onChange={(e) => setInputObjectHeight(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showRays}
                onChange={(e) => setShowRays(e.target.checked)}
                className="w-4 h-4 accent-neon-cyan"
              />
              <span className="text-sm text-slate-300">Показать лучи</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFocusPoints}
                onChange={(e) => setShowFocusPoints(e.target.checked)}
                className="w-4 h-4 accent-neon-cyan"
              />
              <span className="text-sm text-slate-300">Показать фокусные точки</span>
            </label>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neon-cyan mb-4">
            Линзы и зеркала
          </h2>
          <p className="text-slate-300 mb-4">
            Изучите, как линзы и зеркала формируют изображения с помощью трассировки луча света.
            Используйте уравнение линзы для расчета положения и размера изображения.
          </p>
        </div>

        {/* Lens Equation */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <p className="font-semibold text-neon-cyan mb-2">Уравнение линзы</p>
          <p className="text-slate-400 font-mono mb-2">1/f = 1/d₀ + 1/dᵢ</p>
          <p className="text-xs text-slate-500">
            f - фокусное расстояние, d₀ - расстояние объекта, dᵢ - расстояние изображения
          </p>
        </div>

        {/* Magnification */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <p className="font-semibold text-neon-cyan mb-2">Увеличение</p>
          <p className="text-slate-400 font-mono mb-2">M = -dᵢ / d₀</p>
          <p className="text-xs text-slate-500">
            M &lt; 0: перевёрнутое, M &gt; 1: увеличенное, M &lt; 1: уменьшенное
          </p>
        </div>

        {/* Results */}
        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-neon-cyan mb-3">Результаты расчёта</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
              <span className="text-slate-400">Расстояние изображения:</span>
              <span className="text-neon-cyan font-mono">
                {imageProps.imageDistance === null
                  ? "—"
                  : imageProps.imageDistance === Infinity
                    ? "∞"
                    : imageProps.imageDistance.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
              <span className="text-slate-400">Увеличение:</span>
              <span className="text-neon-cyan font-mono">
                {imageProps.magnification === null
                  ? "—"
                  : imageProps.magnification === Infinity
                    ? "∞"
                    : imageProps.magnification.toFixed(2)}x
              </span>
            </div>
            <div className="flex justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
              <span className="text-slate-400">Тип изображения:</span>
              <span className={`font-mono ${imageProps.isReal ? "text-neon-cyan" : "text-neon-amber"}`}>
                {imageProps.isReal ? "Реальное" : "Виртуальное"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
