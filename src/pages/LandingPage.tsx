import { Link } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  Brain,
  Zap,
  Lock,
  Camera,
} from "lucide-react";

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold">
              SENTINEL EDGE <span className="text-cyan-400">AI</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex gap-8 text-slate-300">
            <a href="#home" className="text-cyan-400">
              Home
            </a>
            <a href="#">Features</a>
            <a href="#">Solutions</a>
            <a href="#pricing">Pricing</a>
            <a href="#security">Security</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>

          </nav>


          {/* Buttons */}
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-5 py-2 rounded-xl border border-slate-700 hover:border-cyan-400"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">


        {/* Left */}


        <div>
          <span className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm mb-6">
            AI POWERED SURVEILLANCE
          </span>

          <h2 className="text-6xl font-bold leading-tight mb-6">
            <span className="text-cyan-400">Intelligent Security.</span> 
            <br />
            Real-Time <span className="text-cyan-400">Protection.</span>
          </h2>

          <p className="text-slate-400 text-xl mb-8 leading-relaxed">
            Sentinel Edge AI delivers real-time threat detection,
            intelligent analytics, and advanced monitoring.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <Feature
              icon={<Brain className="w-6 h-6 text-cyan-400" />}
              title="AI Detection"
            />
            <Feature
              icon={<Zap className="w-6 h-6 text-violet-400" />}
              title="Edge Processing"
            />
            <Feature
              icon={<Lock className="w-6 h-6 text-emerald-400" />}
              title="Secure Access"
            />
          </div>

          <div className="flex gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 font-semibold flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="px-6 py-3 rounded-xl border border-slate-700"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Right Dashboard Preview */}
        <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6 shadow-2xl">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Stat label="Cameras" value="48" />
            <Stat label="Alerts" value="12" />
            <Stat label="Threats" value="24" />
            <Stat label="Status" value="Online" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CameraCard title="Main Gate" />
            <CameraCard title="Parking Area" />
            <CameraCard title="Office Entry" />
            <CameraCard title="Warehouse" />
          </div>
        </div>
      </section>

      {/* Placeholder anchors for rest of navbar */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-4">Features</h2>
        <p className="text-slate-400">Coming soon.</p>
      </section>
      <section id="solutions" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-4">Solutions</h2>
        <p className="text-slate-400">Coming soon.</p>
      </section>
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-4">Pricing</h2>
        <p className="text-slate-400">Coming soon.</p>
      </section>
      <section id="about" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-4">About</h2>
        <p className="text-slate-400">Coming soon.</p>
      </section>
      <section id="contact" className="max-w-7xl mx-auto px-6 py-16 pb-24">
        <h2 className="text-3xl font-bold mb-4">Contact</h2>
        <p className="text-slate-400">Coming soon.</p>
      </section>

    </div>
  );
}


function Feature({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
      <div className="mb-2">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function CameraCard({ title }: { title: string }) {
  return (
    <div className="rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
      <div className="h-32 flex items-center justify-center bg-slate-900">
        <Camera className="w-8 h-8 text-slate-500" />
      </div>
      <div className="p-3 text-sm text-slate-300">{title}</div>
    </div>
  );
}