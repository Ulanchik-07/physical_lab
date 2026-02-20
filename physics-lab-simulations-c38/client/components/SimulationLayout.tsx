import Layout from "./Layout";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface SimulationLayoutProps {
  title: string;
  children: ReactNode;
  canvas: ReactNode;
  controls: ReactNode;
}

export default function SimulationLayout({
  title,
  children,
  canvas,
  controls,
}: SimulationLayoutProps) {
  return (
    <Layout>
      {/* Header with back button */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-neon-cyan"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-neon-cyan">{title}</h1>
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas - Left side */}
            <div className="lg:col-span-2">
              <div className="card-glass neon-border p-4 min-h-[500px] lg:min-h-[600px] flex items-center justify-center overflow-hidden">
                {canvas}
              </div>
            </div>

            {/* Controls - Right side */}
            <div>
              <div className="card-glass neon-border-amber p-6 sticky top-[120px] max-h-[calc(100vh-140px)] overflow-y-auto">
                <h2 className="text-lg font-bold text-neon-amber mb-6">
                  Controls
                </h2>
                {controls}
              </div>
            </div>
          </div>

          {/* Extra information section */}
          {children && (
            <div className="mt-8 card-glass neon-border p-6">
              {children}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
