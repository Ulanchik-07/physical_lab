import { useState, useRef, useEffect, useCallback } from "react";
import SimulationLayout from "@/components/SimulationLayout";

interface Cell {
  temp: number;
}

export default function HeatTransfer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const gridSizeRef = useRef(20);

  // Controls
  const [hotTemp, setHotTemp] = useState(100);
  const [coldTemp, setColdTemp] = useState(0);
  const [conductivity, setConductivity] = useState(0.2);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientTemp, setAmbientTemp] = useState(20);

  // Input states for Calculate button
  const [inputHotTemp, setInputHotTemp] = useState("100");
  const [inputColdTemp, setInputColdTemp] = useState("0");
  const [inputConductivity, setInputConductivity] = useState("0.2");
  const [inputAmbientTemp, setInputAmbientTemp] = useState("20");

  // Handle calculate
  const handleCalculate = () => {
    const hot = parseFloat(inputHotTemp);
    const cold = parseFloat(inputColdTemp);
    const cond = parseFloat(inputConductivity);
    const ambient = parseFloat(inputAmbientTemp);

    if (isNaN(hot) || isNaN(cold) || isNaN(cond) || isNaN(ambient)) {
      alert("Пожалуйста введите корректные числа");
      return;
    }

    if (hot < 0 || hot > 150) {
      alert("Горячая температура должна быть от 0 до 150°C");
      return;
    }
    if (cold < -50 || cold > 50) {
      alert("Холодная температура должна быть от -50 до 50°C");
      return;
    }
    if (cond < 0.01 || cond > 0.5) {
      alert("Проводимость должна быть от 0.01 до 0.5");
      return;
    }
    if (ambient < -20 || ambient > 50) {
      alert("Температура окружающей среды должна быть от -20 до 50°C");
      return;
    }

    setHotTemp(hot);
    setColdTemp(cold);
    setConductivity(cond);
    setAmbientTemp(ambient);
  };

  // Simulation state
  const stateRef = useRef<{
    grid: Cell[][];
    isActive: boolean;
  }>({
    grid: [],
    isActive: false,
  });

  // Initialize grid
  const initializeGrid = useCallback(() => {
    const size = gridSizeRef.current;
    const newGrid: Cell[][] = [];
    for (let i = 0; i < size; i++) {
      newGrid[i] = [];
      for (let j = 0; j < size; j++) {
        if (i < 3) {
          newGrid[i][j] = { temp: hotTemp };
        } else if (i > size - 4) {
          newGrid[i][j] = { temp: coldTemp };
        } else {
          newGrid[i][j] = { temp: ambientTemp };
        }
      }
    }
    stateRef.current.grid = newGrid;
  }, [hotTemp, coldTemp, ambientTemp]);

  // Initialize on mount
  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  // Update isActive when isRunning changes
  useEffect(() => {
    stateRef.current.isActive = isRunning;
    if (isRunning) {
      initializeGrid();
    }
  }, [isRunning, initializeGrid]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = Date.now();

    const animate = () => {
      const state = stateRef.current;
      const currentTime = Date.now();
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      // Heat diffusion
      if (state.isActive) {
        const size = gridSizeRef.current;
        const grid = state.grid;
        
        // Create new grid for next step
        const newGrid: Cell[][] = [];
        for (let i = 0; i < size; i++) {
          newGrid[i] = [];
          for (let j = 0; j < size; j++) {
            if (i < 3) {
              newGrid[i][j] = { temp: hotTemp };
            } else if (i > size - 4) {
              newGrid[i][j] = { temp: coldTemp };
            } else {
              let avgTemp = grid[i][j].temp;

              // Get neighbors and apply heat diffusion
              const neighbors = [
                [i - 1, j],
                [i + 1, j],
                [i, j - 1],
                [i, j + 1],
              ];

              for (const [ni, nj] of neighbors) {
                if (
                  ni >= 0 &&
                  ni < size &&
                  nj >= 0 &&
                  nj < size
                ) {
                  const tempDiff = grid[ni][nj].temp - grid[i][j].temp;
                  avgTemp += tempDiff * conductivity;
                }
              }

              newGrid[i][j] = { temp: avgTemp };
            }
          }
        }

        state.grid = newGrid;
      }

      // Drawing
      const size = gridSizeRef.current;
      const grid = state.grid;
      const cellSize = canvas.width / size;

      // Clear canvas
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw temperature grid
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const temp = grid[i]?.[j]?.temp ?? ambientTemp;
          const normalized = Math.max(0, Math.min(1, temp / 100));

          // Color based on temperature
          let r, g, b;
          if (normalized < 0.5) {
            // Blue to white
            const t = normalized * 2;
            r = t * 255;
            g = t * 255;
            b = 255;
          } else {
            // White to red
            const t = (normalized - 0.5) * 2;
            r = 255;
            g = (1 - t) * 255;
            b = (1 - t) * 255;
          }

          ctx.fillStyle = `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }

      // Draw grid lines
      ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= size; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
      }

      // Draw hot source indicator
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
      ctx.fillRect(0, 0, cellSize * 3, canvas.height);
      ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, cellSize * 3, canvas.height);

      // Draw cold source indicator
      ctx.fillStyle = "rgba(0, 100, 255, 0.4)";
      ctx.fillRect(canvas.width - cellSize * 3, 0, cellSize * 3, canvas.height);
      ctx.strokeStyle = "rgba(0, 150, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        canvas.width - cellSize * 3,
        0,
        cellSize * 3,
        canvas.height
      );

      // Draw labels
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12px Inter";
      ctx.fillText("HOT", 5, 15);
      ctx.fillText("COLD", canvas.width - 35, 15);

      // Draw temperature scale
      ctx.font = "12px Inter";
      ctx.fillText(`Hot: ${hotTemp}°C`, 10, canvas.height - 10);
      ctx.fillText(`Cold: ${coldTemp}°C`, canvas.width - 120, canvas.height - 10);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hotTemp, coldTemp, conductivity, ambientTemp]);

  return (
    <SimulationLayout
      title="Теплопередача - Heat Transfer"
      canvas={
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-full max-w-sm mx-auto"
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

          {/* Hot Temperature */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Hot Source: {hotTemp}°C
            </label>
            <input
              type="number"
              min="0"
              max="150"
              value={inputHotTemp}
              onChange={(e) => setInputHotTemp(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
            />
            <p className="text-xs text-slate-400 mt-1">
              Temperature on left side
            </p>
          </div>

          {/* Cold Temperature */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Cold Source: {coldTemp}°C
            </label>
            <input
              type="number"
              min="-50"
              max="50"
              value={inputColdTemp}
              onChange={(e) => setInputColdTemp(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
            />
            <p className="text-xs text-slate-400 mt-1">
              Temperature on right side
            </p>
          </div>

          {/* Ambient Temperature */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Ambient: {ambientTemp}°C
            </label>
            <input
              type="number"
              min="-20"
              max="50"
              value={inputAmbientTemp}
              onChange={(e) => setInputAmbientTemp(e.target.value)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400 disabled:opacity-50"
            />
            <p className="text-xs text-slate-400 mt-1">
              Initial temperature
            </p>
          </div>

          {/* Thermal Conductivity */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Conductivity: {(conductivity * 100).toFixed(0)}%
            </label>
            <input
              type="number"
              min="0.01"
              max="0.5"
              step="0.01"
              value={inputConductivity}
              onChange={(e) => setInputConductivity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:border-amber-400"
            />
            <p className="text-xs text-slate-400 mt-1">Heat transfer rate</p>
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
                initializeGrid();
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
          About Heat Transfer
        </h2>
        <p className="text-slate-300 mb-4">
          Heat transfer is the movement of thermal energy from a hotter object
          to a cooler one. This simulation demonstrates thermal conduction, where
          heat spreads through a material from hot to cold regions.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Fourier's Law</p>
            <p className="text-slate-400 mt-2">Q = -kA(dT/dx)</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <p className="font-semibold text-neon-cyan">Conduction</p>
            <p className="text-slate-400 mt-2">Heat through direct contact</p>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
}
