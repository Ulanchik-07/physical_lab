import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Simulations
import Pendulum from "./pages/simulations/Pendulum";
import ProjectileMotion from "./pages/simulations/ProjectileMotion";
import LightRefraction from "./pages/simulations/LightRefraction";
import HeatTransfer from "./pages/simulations/HeatTransfer";
import ElectricCircuit from "./pages/simulations/ElectricCircuit";
import OhmsLaw from "./pages/simulations/OhmsLaw";
import WireResistance from "./pages/simulations/WireResistance";
import Magnets from "./pages/simulations/Magnets";
import GeometricOptics from "./pages/simulations/GeometricOptics";
import SoundWaves from "./pages/simulations/SoundWaves";
import PendulumLab from "./pages/simulations/PendulumLab";
import HydrogenAtom from "./pages/simulations/HydrogenAtom";
import SimpleHarmonicMotion from "./pages/simulations/SimpleHarmonicMotion";
import EnergyConservation from "./pages/simulations/EnergyConservation";
import Collisions from "./pages/simulations/Collisions";
import WaveInterference from "./pages/simulations/WaveInterference";
import DopplerEffect from "./pages/simulations/DopplerEffect";

const queryClient = new QueryClient();

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Simulation Routes */}
          <Route path="/simulations/pendulum" element={<Pendulum />} />
          <Route path="/simulations/projectile-motion" element={<ProjectileMotion />} />
          <Route path="/simulations/light-refraction" element={<LightRefraction />} />
          <Route path="/simulations/heat-transfer" element={<HeatTransfer />} />
          <Route path="/simulations/electric-circuit" element={<ElectricCircuit />} />
          <Route path="/simulations/ohms-law" element={<OhmsLaw />} />
          <Route path="/simulations/wire-resistance" element={<WireResistance />} />
          <Route path="/simulations/magnets" element={<Magnets />} />
          <Route path="/simulations/geometric-optics" element={<GeometricOptics />} />
          <Route path="/simulations/sound-waves" element={<SoundWaves />} />
          <Route path="/simulations/pendulum-lab" element={<PendulumLab />} />
          <Route path="/simulations/hydrogen-atom" element={<HydrogenAtom />} />
          <Route path="/simulations/simple-harmonic-motion" element={<SimpleHarmonicMotion />} />
          <Route path="/simulations/energy-conservation" element={<EnergyConservation />} />
          <Route path="/simulations/collisions" element={<Collisions />} />
          <Route path="/simulations/wave-interference" element={<WaveInterference />} />
          <Route path="/simulations/doppler-effect" element={<DopplerEffect />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
