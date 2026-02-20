import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const categories = [
  { name: "Mechanics", href: "/category/mechanics" },
  { name: "Optics", href: "/category/optics" },
  { name: "Thermodynamics", href: "/category/thermodynamics" },
  { name: "Electricity", href: "/category/electricity" },
];

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-blue-500 rounded-lg flex items-center justify-center font-bold text-slate-900 group-hover:shadow-lg group-hover:shadow-neon-cyan/50 transition-all">
                P
              </div>
              <span className="font-bold text-lg glow-text hidden sm:inline">
                PhysicLab
              </span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search simulations..."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Categories Navigation */}
            <nav className="hidden lg:flex gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.href}
                  className="text-sm text-slate-300 hover:text-neon-cyan transition-colors duration-200"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-16 py-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-400 text-sm">
            <p>
              &copy; 2024 PhysicLab. A modern platform for interactive physics
              simulations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
