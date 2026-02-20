import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description: string;
}

export default function SimulationPlaceholder({
  title,
  description,
}: PlaceholderProps) {
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

      {/* Main Content */}
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-neon-cyan/20 border border-neon-cyan/50 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-neon-cyan" />
          </div>

          <h2 className="text-3xl font-bold mb-4">
            Coming Soon
          </h2>

          <p className="text-slate-300 mb-2">{title}</p>
          <p className="text-slate-400 mb-8">{description}</p>

          <p className="text-sm text-slate-500 mb-6">
            This simulation is currently under development. Check back soon or{" "}
            <span className="text-neon-cyan font-semibold">
              prompt to have it built
            </span>
            .
          </p>

          <Link
            to="/"
            className="inline-block px-6 py-3 bg-neon-cyan text-slate-900 rounded-lg font-semibold hover:shadow-lg hover:shadow-neon-cyan/50 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
