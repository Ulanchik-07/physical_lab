import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

export default function WaveInterference() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Controls
  const [frequency1, setFrequency1] = useState(1);
  const [frequency2, setFrequency2] = useState(1);
  const [amplitude1, setAmplitude1] = useState(30);
  const [amplitude2, setAmplitude2] = useState(30);
  const [phase, setPhase] = useState(0);
  const [showWave1, setShowWave1] = useState(true);
  const [showWave2, setShowWave2] = useState(true);
  const [showResult, setShowResult] = useState(true);

  // Input fields
  const [inputFrequency1, setInputFrequency1] = useState("1");
  const [inputFrequency2, setInputFrequency2] = useState("1");
  const [inputAmplitude1, setInputAmplitude1] = useState("30");
  const [inputAmplitude2, setInputAmplitude2] = useState("30");
  const [inputPhase, setInputPhase] = useState("0");

  const handleCalculate = () => {
    const f1 = parseFloat(inputFrequency1) || 1;
    const f2 = parseFloat(inputFrequency2) || 1;
    const a1 = parseFloat(inputAmplitude1) || 30;
    const a2 = parseFloat(inputAmplitude2) || 30;
    const p = parseFloat(inputPhase) || 0;
    
    setFrequency1(Math.min(3, Math.max(0.5, f1)));
    setFrequency2(Math.min(3, Math.max(0.5, f2)));
    setAmplitude1(Math.min(60, Math.max(10, a1)));
    setAmplitude2(Math.min(60, Math.max(10, a2)));
    setPhase(Math.min(2 * Math.PI, Math.max(0, p)));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, width, height);

    // Draw axis
    ctx.strokeStyle = "rgba(0, 217, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Draw grid
    ctx.strokeStyle = "rgba(0, 217, 255, 0.05)";
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    // Function to draw a wave
    const drawWave = (
      frequency: number,
      amplitude: number,
      phaseOffset: number,
      color: string,
      offset: number = 0
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      let firstPoint = true;
      for (let x = 0; x < width; x += 2) {
        const waveX = (x / width) * Math.PI * 4 * frequency;
        const y = centerY + amplitude * Math.sin(waveX + phaseOffset) + offset;

        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    // Draw individual waves
    if (showWave1) {
      drawWave(frequency1, amplitude1, 0, "rgba(100, 150, 255, 0.6)");
    }
    if (showWave2) {
      drawWave(frequency2, amplitude2, phase, "rgba(255, 100, 150, 0.6)");
    }

    // Draw result (superposition)
    if (showResult) {
      ctx.strokeStyle = "rgba(100, 255, 100, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();

      let firstPoint = true;
      for (let x = 0; x < width; x += 2) {
        const waveX = (x / width) * Math.PI * 4;
        const y1 = amplitude1 * Math.sin(waveX * frequency1);
        const y2 = amplitude2 * Math.sin(waveX * frequency2 + phase);
        const y = centerY + y1 + y2;

        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw info
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "12px Inter";
    ctx.fillText(`Wave 1: f = ${frequency1.toFixed(2)}, A = ${amplitude1}`, 20, 25);
    ctx.fillText(`Wave 2: f = ${frequency2.toFixed(2)}, A = ${amplitude2}`, 20, 45);
    ctx.fillText(`Phase diff: ${(phase * 180 / Math.PI).toFixed(1)}°`, 20, 65);

    // Interference type
    let interference = "Конструктивная";
    const phaseDiff = Math.abs(phase % (Math.PI * 2));
    if (phaseDiff > Math.PI * 0.4 && phaseDiff < Math.PI * 0.6) {
      interference = "Деструктивная";
    } else if (phaseDiff > Math.PI * 1.4 && phaseDiff < Math.PI * 1.6) {
      interference = "Деструктивная";
    }
    ctx.fillStyle = interference === "Деструктивная" ? "rgba(255, 100, 100, 0.8)" : "rgba(100, 255, 100, 0.8)";
    ctx.fillText(`Интерференция: ${interference}`, 20, 85);
  }, [frequency1, frequency2, amplitude1, amplitude2, phase, showWave1, showWave2, showResult]);

  return (
    <SimulationLayout
      title="Интерференция волн - Wave Interference"
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
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Частота волны 1
            </label>
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              value={inputFrequency1}
              onChange={(e) => setInputFrequency1(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
              placeholder="Введите частоту"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Амплитуда волны 1
            </label>
            <input
              type="number"
              min="10"
              max="60"
              step="1"
              value={inputAmplitude1}
              onChange={(e) => setInputAmplitude1(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
              placeholder="Введите амплитуду"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Частота волны 2
            </label>
            <input
              type="number"
              min="0.5"
              max="3"
              step="0.1"
              value={inputFrequency2}
              onChange={(e) => setInputFrequency2(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
              placeholder="Введите частоту"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Амплитуда волны 2
            </label>
            <input
              type="number"
              min="10"
              max="60"
              step="1"
              value={inputAmplitude2}
              onChange={(e) => setInputAmplitude2(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
              placeholder="Введите амплитуду"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Разность фаз, рад
            </label>
            <input
              type="number"
              min="0"
              max={Math.PI * 2}
              step="0.1"
              value={inputPhase}
              onChange={(e) => setInputPhase(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
              placeholder="Введите фазу"
            />
          </div>

          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Рассчитать
          </button>

          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWave1}
                onChange={(e) => setShowWave1(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              <span className="text-sm text-slate-300">Волна 1</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWave2}
                onChange={(e) => setShowWave2(e.target.checked)}
                className="w-4 h-4 accent-cyan-400"
              />
              <span className="text-sm text-slate-300">Волна 2</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showResult}
                onChange={(e) => setShowResult(e.target.checked)}
                className="w-4 h-4 accent-neon-cyan"
              />
              <span className="text-sm text-slate-300">Результирующая волна</span>
            </label>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neon-cyan mb-4">
            Интерференция волн
          </h2>
          <p className="text-slate-300 mb-4">
            Когда две волны встречаются, они накладываются, создавая интерференцию.
            Результирующая амплитуда зависит от разности фаз между волнами.
          </p>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <p className="font-semibold text-neon-cyan mb-2">Принцип суперпозиции</p>
          <p className="text-slate-400 text-sm">
            y = y₁ + y₂ = A₁sin(ωt) + A₂sin(ωt + φ)
          </p>
        </div>

        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-neon-cyan mb-3">Типы интерференции</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <div>
              <span className="text-green-400">✓ Конструктивная:</span> волны в фазе, амплитуда максимальна
            </div>
            <div>
              <span className="text-red-400">✗ Деструктивная:</span> волны в противофазе, амплитуда минимальна
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
