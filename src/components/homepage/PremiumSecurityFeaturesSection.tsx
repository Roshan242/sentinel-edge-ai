import React from "react";

type Feature = {
  title: string;
  description: string;
  learnMoreHref: string;
  icon: React.ReactNode;
};

function IconSvg({ pathD }: { pathD: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className="w-6 h-6"
    >
      <path
        d={pathD}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article
      className="group relative h-full flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur px-6 py-6 overflow-hidden shadow-[0_0_0_1px_rgba(56,189,248,0.06)]"
    >
      {/* Background gradients + subtle glow */}
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-24 left-1/2 h-56 w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.18),transparent_65%)]" />
        <div className="absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.14),transparent_65%)]" />
      </div>

      {/* Gradient accent on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(34,211,238,0.08),transparent_55%)]" />
        <div className="absolute inset-0 rounded-2xl border border-cyan-400/30 shadow-[0_0_40px_rgba(34,211,238,0.15)]" />
      </div>

      {/* Border glow effect */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(70%_60%_at_50%_0%,rgba(59,130,246,0.25)_0%,transparent_60%),radial-gradient(55%_55%_at_0%_50%,rgba(6,182,212,0.20)_0%,transparent_55%)]" />
      </div>

      <div className="relative flex items-start gap-4">
        <div className="relative shrink-0 w-12 h-12 rounded-xl border border-blue-400/20 bg-blue-500/10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-blue-500/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative text-cyan-200 group-hover:text-white">
            {feature.icon}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-white leading-snug">
            {feature.title}
          </h3>
        </div>
      </div>

      <p className="relative mt-4 text-sm md:text-[15px] text-slate-300 leading-relaxed">
        {feature.description}
      </p>

      <div className="relative mt-6 flex items-center justify-between gap-3">
        <a
          href={feature.learnMoreHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded"
          aria-label={`Learn more about ${feature.title}`}
        >
          Learn More
          <svg
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M8 5.5L12.5 10L8 14.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>

        <div className="hidden sm:flex items-center">
          <div className="w-2 h-2 rounded-full bg-blue-400/60 group-hover:bg-blue-400 transition-colors" />
          <div className="ml-2 h-[1px] w-14 bg-gradient-to-r from-blue-400/40 via-cyan-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="relative mt-6 flex-1" />

      {/* Hover lift */}
      <style>{`
        article{transition:transform .25s ease, border-color .25s ease, background-color .25s ease;}
        article:hover{transform:translateY(-6px); border-color:rgba(56,189,248,0.35);}
      `}</style>
    </article>
  );
}

export default function PremiumSecurityFeaturesSection() {
  const features: Feature[] = [
    {
      title: "AI Threat Detection",
      description:
        "Detect suspicious login behavior and security anomalies using intelligent analysis.",
      learnMoreHref: "#",
      icon: (
        <IconSvg pathD="M12 2.8l7 3.6v6.1c0 5-3.1 8.8-7 10.7-3.9-1.9-7-5.7-7-10.7V6.4l7-3.6zM9.2 12.2l1.8 1.8 3.8-4" />
      ),
    },
    {
      title: "Smart Camera Monitoring",
      description:
        "Monitor connected surveillance devices in real time from a centralized dashboard.",
      learnMoreHref: "#",
      icon: (
        <IconSvg pathD="M6.5 7.5h11l-1.1 2h-8.8L6.5 7.5zM4.8 9.7v8.2c0 .8.7 1.4 1.4 1.4h11.6c.8 0 1.4-.6 1.4-1.4V9.7c0-.8-.6-1.4-1.4-1.4H6.2c-.7 0-1.4.6-1.4 1.4zM10 14.1h4" />
      ),
    },
    {
      title: "Real-Time Security Alerts",
      description:
        "Receive instant dashboard and email notifications for critical security events.",
      learnMoreHref: "#",
      icon: (
        <IconSvg pathD="M12 22c1.2 0 2.2-1 2.2-2.2H9.8C9.8 21 10.8 22 12 22zM18 16.8V11c0-3.3-2.1-6-6-6s-6 2.7-6 6v5.8L4 19.2h16l-2-2.4z" />
      ),
    },
    {
      title: "Biometric Access Control",
      description:
        "Secure authentication using fingerprint and biometric verification.",
      learnMoreHref: "#",
      icon: (
        <IconSvg pathD="M12 21c4.1 0 7-3.1 7-7 0-4.2-3-9.5-7-12-4 2.5-7 7.8-7 12 0 3.9 2.9 7 7 7zM8.6 11.3c.4-1.6 1.6-2.7 3.4-2.7 1.7 0 3 1.1 3.4 2.7" />
      ),
    },
    {
      title: "Security Analytics",
      description:
        "Gain visibility through threat scoring, activity trends, and system insights.",
      learnMoreHref: "#",
      icon: (
        <IconSvg pathD="M4.5 18V6.8c0-.9.7-1.6 1.6-1.6H20v11.4H6.1c-.9 0-1.6-.7-1.6-1.6zM8 16l2.4-3.4 2 2.2 3.6-5" />
      ),
    },
    {
      title: "Centralized Access Logs",
      description:
        "Track login activity and maintain complete audit trails.",
      learnMoreHref: "#",
      icon: (
        <IconSvg pathD="M7 3h10l2 2v16H7V3zM9 8h8M9 12h8M9 16h5" />
      ),
    },
    {
      title: "Edge Device Management",
      description:
        "Manage ESP32-CAMs, scanners, sensors, and connected edge devices.",
      learnMoreHref: "#",
      icon: (
        <IconSvg pathD="M9 3h6l1.5 2h3V21H4.5V5h3L9 3zM7.5 13.5l2.2-2.2 2.1 2.1 4.2-4.2" />
      ),
    },
    {
      title: "AI-Powered Anomaly Detection",
      description:
        "Identify unusual patterns and detect potential intrusions before escalation.",
      learnMoreHref: "#",
      icon: (
        <IconSvg pathD="M12 2l8 4.6v10.8L12 22l-8-4.6V6.6L12 2zM12 8v4.5" />
      ),
    },
  ];

  const kpis = [
    { value: "99.9%", label: "System Uptime" },
    { value: "<50ms", label: "Response Time" },
    { value: "256-bit", label: "Encryption" },
    { value: "24/7", label: "Active Monitoring" },
  ];

  return (
    <section id="features" className="relative py-16 sm:py-20 overflow-x-hidden">
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1200px circle at 50% -100px, rgba(59,130,246,0.18), transparent 55%), radial-gradient(900px circle at 100% 20%, rgba(6,182,212,0.12), transparent 50%), radial-gradient(700px circle at 0% 80%, rgba(56,189,248,0.10), transparent 45%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badge */}
        <div className="flex items-center justify-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs sm:text-sm">

           <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
                Features
          </span>
        </div>

        {/* Main Heading */}
        <div className="text-center px-1 sm:px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.05] text-white">
            Enterprise-Grade Security Features
          </h2>
          <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Advanced AI, real-time monitoring, biometric authentication, and intelligent analytics for modern security operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        {/* Bottom KPI Section */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 flex flex-col justify-between"
            >
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-blue-200 tracking-tight">
                  {kpi.value}
                </p>
                <p className="mt-2 text-sm sm:text-[14px] text-slate-300">
                  {kpi.label}
                </p>
              </div>
              <div className="mt-6 h-px w-full bg-gradient-to-r from-blue-500/0 via-blue-500/35 to-cyan-500/0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

