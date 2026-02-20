import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import {
  Zap,
  Lightbulb,
  Wind,
  Waves,
  CircleDot,
  Cpu,
  Magnet,
  Airplay,
  Droplet,
  Circle,
  Flower2,
  Radio,
  Flame,
} from "lucide-react";

const simulations = [
  {
    id: "pendulum",
    title: "Маятник",
    description: "Движение простого маятника с настраиваемыми параметрами",
    tags: ["Кинематика", "Гравитация", "Колебания"],
    icon: Circle,
    href: "/simulations/pendulum",
    category: "mechanics",
  },
  {
    id: "pendulum-lab",
    title: "Лаборатория маятника",
    description: "Расширенная лаборатория маятника с подробными измерениями",
    tags: ["Кинематика", "Колебания", "Измерения"],
    icon: Circle,
    href: "/simulations/pendulum-lab",
    category: "mechanics",
  },
  {
    id: "shm",
    title: "Простое гармоническое движение",
    description: "Изучайте SHM с переменными амплитудой и частотой",
    tags: ["Колебания", "Волны", "Гармоника"],
    icon: Flower2,
    href: "/simulations/simple-harmonic-motion",
    category: "mechanics",
  },
  {
    id: "energy-conservation",
    title: "Сохранение энергии",
    description: "Наблюдайте преобразование потенциальной в кинетическую энергию",
    tags: ["Энергия", "Механика", "Законы"],
    icon: Flame,
    href: "/simulations/energy-conservation",
    category: "mechanics",
  },
  {
    id: "collisions",
    title: "Столкновения",
    description: "Упругие и неупругие столкновения между объектами",
    tags: ["Импульс", "Столкновения", "Механика"],
    icon: Circle,
    href: "/simulations/collisions",
    category: "mechanics",
  },
  {
    id: "projectile",
    title: "Движение снаряда",
    description: "Траектория снаряда с контролем угла и скорости",
    tags: ["Кинематика", "Гравитация", "2D движение"],
    icon: Airplay,
    href: "/simulations/projectile-motion",
    category: "mechanics",
  },
  {
    id: "refraction",
    title: "Преломление света",
    description: "Закон Снелла и преломление света в разных средах",
    tags: ["Оптика", "Свет", "Преломление"],
    icon: Lightbulb,
    href: "/simulations/light-refraction",
    category: "optics",
  },
  {
    id: "geometric-optics",
    title: "Геометрическая оптика (основы)",
    description: "Линзы и зеркала с трассировкой лучей",
    tags: ["Оптика", "Геометрия", "Свет"],
    icon: Lightbulb,
    href: "/simulations/geometric-optics",
    category: "optics",
  },
  {
    id: "heat-transfer",
    title: "Теплопередача",
    description: "Визуализация теплопередачи между объектами",
    tags: ["Термодинамика", "Тепло", "Температура"],
    icon: Droplet,
    href: "/simulations/heat-transfer",
    category: "thermodynamics",
  },
  {
    id: "electric-circuit",
    title: "Электрическая цепь",
    description: "Симуляция цепи с напряжением, током и сопротивлением",
    tags: ["Электричество", "Цепи", "Ток"],
    icon: Zap,
    href: "/simulations/electric-circuit",
    category: "electricity",
  },
  {
    id: "ohms-law",
    title: "Закон Ома",
    description: "Интерактивная демонстрация закона Ома: V = IR",
    tags: ["Электричество", "Напряжение", "Сопротивление"],
    icon: CircleDot,
    href: "/simulations/ohms-law",
    category: "electricity",
  },
  {
    id: "wire-resistance",
    title: "Сопротивление в проводе",
    description: "Влияние свойств провода на электрическое сопротивление",
    tags: ["Электричество", "Проводимость", "Сопротивление"],
    icon: Wind,
    href: "/simulations/wire-resistance",
    category: "electricity",
  },
  {
    id: "magnets",
    title: "Магниты и электромагниты",
    description: "Визуализация магнитных полей и взаимодействия магнитов",
    tags: ["Магнетизм", "Электромагниты", "Поля"],
    icon: Magnet,
    href: "/simulations/magnets",
    category: "electricity",
  },
  {
    id: "sound-waves",
    title: "Звуковые волны",
    description: "Распространение звука и интерференция волн",
    tags: ["Волны", "Звук", "Частота"],
    icon: Waves,
    href: "/simulations/sound-waves",
    category: "waves",
  },
  {
    id: "wave-interference",
    title: "Интерференция волн",
    description: "Суперпозиция волн и интерференционные картины",
    tags: ["Волны", "Интерференция", "Суперпозиция"],
    icon: Waves,
    href: "/simulations/wave-interference",
    category: "waves",
  },
  {
    id: "doppler",
    title: "Эффект Доплера",
    description: "Изменение частоты из-за движения источника",
    tags: ["Волны", "Звук", "Доплер"],
    icon: Radio,
    href: "/simulations/doppler-effect",
    category: "waves",
  },
  {
    id: "hydrogen-atom",
    title: "Модели атома водорода",
    description: "Модель Бора и квантовые представления",
    tags: ["Атомная физика", "Квантовая", "Орбитали"],
    icon: Cpu,
    href: "/simulations/hydrogen-atom",
    category: "modern",
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background grid */}
        <div className="absolute inset-0 grid-bg opacity-30" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/80" />

        {/* Animated blobs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-20 animate-pulse" />

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block mb-6">
            <div className="px-4 py-2 bg-neon-cyan/20 border border-neon-cyan/50 rounded-full">
              <span className="text-neon-cyan text-sm font-semibold">
                Welcome to Interactive Physics
              </span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-neon-cyan via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              PhysicLab
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed">
            Explore physics through interactive simulations. Adjust parameters
            in real-time and watch how the universe responds.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/simulations/pendulum"
              className="btn-neon-cyan inline-block hover:scale-105 transition-transform"
            >
              Start Experimenting
            </Link>
            <button className="px-6 py-2 border border-slate-600 hover:border-neon-cyan rounded-lg transition-colors text-slate-300 hover:text-neon-cyan font-semibold">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Simulations Grid Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Available Simulations</h2>
          <p className="text-slate-400 text-lg">
            Choose from our collection of interactive physics experiments
          </p>
        </div>

        {/* Category Sections */}
        <div className="space-y-16">
          {/* Mechanics */}
          <div>
            <h3 className="text-2xl font-bold text-neon-cyan mb-6">
              Механика (Mechanics)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations
                .filter((s) => s.category === "mechanics")
                .map((sim) => (
                  <SimulationCard key={sim.id} simulation={sim} />
                ))}
            </div>
          </div>

          {/* Waves */}
          <div>
            <h3 className="text-2xl font-bold text-neon-cyan mb-6">
              Волны (Waves & Oscillations)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations
                .filter((s) => s.category === "waves")
                .map((sim) => (
                  <SimulationCard key={sim.id} simulation={sim} />
                ))}
            </div>
          </div>

          {/* Optics */}
          <div>
            <h3 className="text-2xl font-bold text-neon-cyan mb-6">
              Оптика (Optics)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations
                .filter((s) => s.category === "optics")
                .map((sim) => (
                  <SimulationCard key={sim.id} simulation={sim} />
                ))}
            </div>
          </div>

          {/* Thermodynamics */}
          <div>
            <h3 className="text-2xl font-bold text-neon-cyan mb-6">
              Термодинамика (Thermodynamics)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations
                .filter((s) => s.category === "thermodynamics")
                .map((sim) => (
                  <SimulationCard key={sim.id} simulation={sim} />
                ))}
            </div>
          </div>

          {/* Electricity */}
          <div>
            <h3 className="text-2xl font-bold text-neon-cyan mb-6">
              Электричество (Electricity & Magnetism)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations
                .filter((s) => s.category === "electricity")
                .map((sim) => (
                  <SimulationCard key={sim.id} simulation={sim} />
                ))}
            </div>
          </div>

          {/* Modern Physics */}
          <div>
            <h3 className="text-2xl font-bold text-neon-cyan mb-6">
              Современная физика (Modern Physics)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations
                .filter((s) => s.category === "modern")
                .map((sim) => (
                  <SimulationCard key={sim.id} simulation={sim} />
                ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

interface SimulationCardProps {
  simulation: (typeof simulations)[0];
}

function SimulationCard({ simulation }: SimulationCardProps) {
  const Icon = simulation.icon;

  return (
    <Link
      to={simulation.href}
      className="group h-full card-glass hover:neon-border p-6 transition-all duration-300 hover:scale-105 cursor-pointer"
    >
      {/* Icon Container */}
      <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:from-neon-cyan/40 group-hover:to-blue-500/40 transition-all">
        <Icon className="w-8 h-8 text-neon-cyan" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold mb-2 group-hover:text-neon-cyan transition-colors">
        {simulation.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
        {simulation.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {simulation.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-1 bg-slate-800/50 text-slate-300 rounded border border-slate-700 group-hover:border-neon-cyan/50 group-hover:bg-slate-800 transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Launch Button */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <button className="w-full py-2 px-4 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 rounded-lg hover:bg-neon-cyan/20 transition-colors font-semibold text-sm group-hover:border-neon-cyan/60">
          Launch Simulation
        </button>
      </div>
    </Link>
  );
}
