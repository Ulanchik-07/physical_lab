import { useState, useRef, useEffect } from "react";
import SimulationLayout from "@/components/SimulationLayout";

export default function DopplerEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Controls
  const [sourceFrequency, setSourceFrequency] = useState(440);
  const [sourceVelocity, setSourceVelocity] = useState(0);
  const [observerVelocity, setObserverVelocity] = useState(0);
  const [soundSpeed, setSoundSpeed] = useState(343);
  const [showWaves, setShowWaves] = useState(true);

  // Input states for Calculate button
  const [inputSourceFrequency, setInputSourceFrequency] = useState("440");
  const [inputSourceVelocity, setInputSourceVelocity] = useState("0");
  const [inputObserverVelocity, setInputObserverVelocity] = useState("0");
  const [inputSoundSpeed, setInputSoundSpeed] = useState("343");

  // Handle calculate
  const handleCalculate = () => {
    const freq = parseFloat(inputSourceFrequency);
    const srcVel = parseFloat(inputSourceVelocity);
    const obsVel = parseFloat(inputObserverVelocity);
    const speed = parseFloat(inputSoundSpeed);

    if (isNaN(freq) || isNaN(srcVel) || isNaN(obsVel) || isNaN(speed)) {
      alert("Пожалуйста введите корректные числа");
      return;
    }

    if (freq < 200 || freq > 800) {
      alert("Частота источника должна быть от 200 до 800 Hz");
      return;
    }
    if (srcVel < -100 || srcVel > 100) {
      alert("Скорость источника должна быть от -100 до 100 м/с");
      return;
    }
    if (obsVel < -100 || obsVel > 100) {
      alert("Скорость наблюдателя должна быть от -100 до 100 м/с");
      return;
    }
    if (speed < 300 || speed > 400) {
      alert("Скорость звука должна быть от 300 до 400 м/с");
      return;
    }

    setSourceFrequency(freq);
    setSourceVelocity(srcVel);
    setObserverVelocity(obsVel);
    setSoundSpeed(speed);
  };

  // Calculate observed frequency using Doppler formula
  // f' = f * (v_sound + v_observer) / (v_sound - v_source)
  const observedFrequency =
    sourceFrequency *
    ((soundSpeed + observerVelocity) / (soundSpeed - sourceVelocity));

  const frequencyShift = observedFrequency - sourceFrequency;
  const percentChange = (frequencyShift / sourceFrequency) * 100;

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
    ctx.strokeStyle = "rgba(0, 217, 255, 0.05)";
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }

    const centerY = height / 2;
    const sourceX = 100 + sourceVelocity * 30;
    const observerX = 500 + observerVelocity * 30;

    // Draw sound waves (circles)
    if (showWaves) {
      const numWaves = 5;
      const wavelengthOriginal = soundSpeed / sourceFrequency;
      const wavelengthObserved = soundSpeed / observedFrequency;

      for (let i = 1; i <= numWaves; i++) {
        // Original waves
        ctx.strokeStyle = "rgba(100, 150, 255, 0.3)";
        ctx.lineWidth = 1;
        const radius1 = (i * wavelengthOriginal * 30) % 150;
        ctx.beginPath();
        ctx.arc(sourceX, centerY, radius1, 0, Math.PI * 2);
        ctx.stroke();

        // Compressed waves in front
        if (sourceVelocity !== 0) {
          ctx.strokeStyle = "rgba(255, 100, 100, 0.4)";
          const compressedRadius = (i * wavelengthObserved * 20) % 100;
          ctx.beginPath();
          ctx.arc(sourceX, centerY, compressedRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Draw source
    ctx.fillStyle = sourceVelocity > 0 ? "rgba(255, 100, 100, 0.8)" : "rgba(100, 150, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(sourceX, centerY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Draw observer
    ctx.fillStyle = observerVelocity > 0 ? "rgba(100, 200, 255, 0.8)" : "rgba(200, 100, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(observerX, centerY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Draw labels
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "12px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Source", sourceX, centerY + 35);
    ctx.fillText("Observer", observerX, centerY + 35);

    // Draw velocity vectors
    if (sourceVelocity !== 0) {
      ctx.strokeStyle = sourceVelocity > 0 ? "rgba(255, 100, 100, 0.6)" : "rgba(0, 217, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sourceX, centerY - 25);
      ctx.lineTo(sourceX + sourceVelocity * 15, centerY - 25);
      ctx.stroke();

      // Arrow
      const arrowSize = 8;
      const endX = sourceX + sourceVelocity * 15;
      if (sourceVelocity > 0) {
        ctx.beginPath();
        ctx.moveTo(endX, centerY - 25);
        ctx.lineTo(endX - arrowSize, centerY - 25 - arrowSize);
        ctx.lineTo(endX - arrowSize, centerY - 25 + arrowSize);
        ctx.closePath();
        ctx.fill();
      }
    }

    if (observerVelocity !== 0) {
      ctx.strokeStyle = observerVelocity > 0 ? "rgba(100, 200, 255, 0.6)" : "rgba(200, 100, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(observerX, centerY - 25);
      ctx.lineTo(observerX + observerVelocity * 15, centerY - 25);
      ctx.stroke();
    }

    // Draw info
    ctx.textAlign = "left";
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "12px Inter";
    ctx.fillText(`Частота источника: ${sourceFrequency} Hz`, 20, 25);
    ctx.fillText(
      `Воспринимаемая частота: ${observedFrequency.toFixed(1)} Hz`,
      20,
      45
    );
    ctx.fillText(
      `Сдвиг: ${frequencyShift > 0 ? "+" : ""}${frequencyShift.toFixed(1)} Hz (${percentChange > 0 ? "+" : ""}${percentChange.toFixed(1)}%)`,
      20,
      65
    );
  }, [sourceFrequency, sourceVelocity, observerVelocity, soundSpeed, showWaves]);

  return (
    <SimulationLayout
      title="Эффект Доплера - Doppler Effect"
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
              Частота источника: {sourceFrequency} Hz
            </label>
            <input
              type="number"
              min="200"
              max="800"
              value={inputSourceFrequency}
              onChange={(e) => setInputSourceFrequency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Скорость источника: {sourceVelocity.toFixed(1)} м/с
            </label>
            <input
              type="number"
              min="-100"
              max="100"
              step="0.1"
              value={inputSourceVelocity}
              onChange={(e) => setInputSourceVelocity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
            <p className="text-xs text-slate-400 mt-1">
              Положительное = приближается, Отрицательное = удаляется
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Скорость наблюдателя: {observerVelocity.toFixed(1)} м/с
            </label>
            <input
              type="number"
              min="-100"
              max="100"
              step="0.1"
              value={inputObserverVelocity}
              onChange={(e) => setInputObserverVelocity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Скорость звука: {soundSpeed} м/с
            </label>
            <input
              type="number"
              min="300"
              max="400"
              step="0.1"
              value={inputSoundSpeed}
              onChange={(e) => setInputSoundSpeed(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showWaves}
                onChange={(e) => setShowWaves(e.target.checked)}
                className="w-4 h-4 accent-neon-cyan"
              />
              <span className="text-sm text-slate-300">Показать звуковые волны</span>
            </label>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neon-cyan mb-4">
            Эффект Доплера
          </h2>
          <p className="text-slate-300 mb-4">
            Когда источник звука движется к наблюдателю, звуковые волны сжимаются,
            увеличивая частоту. Когда источник удаляется, волны растягиваются, уменьшая частоту.
          </p>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <p className="font-semibold text-neon-cyan mb-2">Формула Доплера</p>
          <p className="text-slate-400 font-mono mb-2">f' = f × (v_s + v_o) / (v_s - v_s)</p>
          <p className="text-xs text-slate-500">
            f' - наблюдаемая частота, f - исходная частота, v_s - скорость звука, v_o - скорость наблюдателя, v_s - скорость источника
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Приближение</p>
            <p className="text-slate-400 mt-2">Частота ↑ (выше)</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Удаление</p>
            <p className="text-slate-400 mt-2">Частота ↓ (ниже)</p>
          </div>
        </div>

        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-neon-cyan mb-3">Примеры</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <div>• Сирена скорой помощи: выше при приближении, ниже при удалении</div>
            <div>• Астрономия: смещение в спектрах звезд и галактик</div>
            <div>• Радар: измерение скорости движущихся объектов</div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
