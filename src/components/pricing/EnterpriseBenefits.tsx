import React from 'react'
import { motion } from 'framer-motion'

const IconWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
    {children}
  </div>
)

const SvgIcon: React.FC<{ path: string; className?: string }> = ({ path, className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className ?? 'w-6 h-6'}
  >
    <path
      d={path}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const items = [
  {
    title: 'AI Threat Detection',
    icon: (
      <SvgIcon
        className="text-blue-200"
        path="M12 2l8 4.5v6.7c0 4.9-3.1 9-8 9s-8-4.1-8-9V6.5L12 2zM9.2 12.2l1.8 1.8 3.8-4"
      />
    ),
    desc: 'On-device intelligence that surfaces verified anomalies and reduces noise.',
  },
  {
    title: '99.9% Uptime',
    icon: (
      <SvgIcon
        className="text-cyan-200"
        path="M12 2l8 4v6c0 5-3.2 9.3-8 10-4.8-.7-8-5-8-10V6l8-4zM9 12l2 2 4-5"
      />
    ),
    desc: 'Resilient operations with continuous monitoring and safe failover.',
  },
  {
    title: 'Military-grade Encryption',
    icon: (
      <SvgIcon
        className="text-blue-200"
        path="M7 10V7a5 5 0 0 1 10 0v3M6 10h12v11H6V10z"
      />
    ),
    desc: 'Secure transport and encrypted audit-grade storage across deployments.',
  },
  {
    title: '24/7 Monitoring',
    icon: (
      <SvgIcon
        className="text-cyan-200"
        path="M12 6V3m7.4 3.2 2.1-2.1M18 13h3m-2.3 4.3 2.1 2.1M12 18v3m-7.4-3.2-2.1 2.1M6 13H3m2.3-4.3L3.2 6.6"
      />
    ),
    desc: 'Proactive detection workflows with escalations when signals matter.',
  },
  {
    title: 'Scalable Infrastructure',
    icon: (
      <SvgIcon
        className="text-blue-200"
        path="M4 6h16M4 12h16M4 18h10"
      />
    ),
    desc: 'Scale from small teams to multi-site deployments with consistent policy.',
  },
  {
    title: 'Enterprise Support',
    icon: (
      <SvgIcon
        className="text-cyan-200"
        path="M4 4h16v12H5.2L4 17V4zM8 8h8M8 12h5"
      />
    ),
    desc: 'Dedicated solutions engineering, SLAs, and onboarding for complex environments.',
  },
]

export default function EnterpriseBenefits() {
  return (
    <section className="mt-10 sm:mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-blue-200 text-xs font-semibold tracking-wider">WHY CHOOSE SENTINEL EDGE AI</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">Built for teams that cannot afford downtime</h2>
          <p className="mt-3 text-slate-300/90 text-sm sm:text-base">
            Premium capabilities designed for modern security operations—secure, observable, and scalable.
          </p>
        </div>

        <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {items.map((it, idx) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: idx * 0.03 }}
              className="h-full rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur p-6 shadow-[0_0_0_1px_rgba(56,189,248,0.05)] hover:border-cyan-400/25 transition-colors"
            >
              <div className="flex items-start gap-4">
                <IconWrap>{it.icon}</IconWrap>
                <div>
                  <h3 className="text-lg font-bold text-white">{it.title}</h3>
                  <p className="mt-2 text-slate-300/90 text-sm leading-relaxed">{it.desc}</p>
                </div>
              </div>
              <div className="mt-5 h-px w-full bg-gradient-to-r from-blue-500/0 via-blue-500/35 to-cyan-500/0" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

