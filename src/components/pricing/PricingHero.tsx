import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Shield, Zap, Bell, PhoneCall, XCircle } from 'lucide-react'

export type TrustBadge = {
  title: string
  description?: string
  icon: React.ReactNode
}

const TrustBadgeItem: React.FC<{ badge: TrustBadge }> = ({ badge }) => {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur px-4 py-3">
      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-200">
        {badge.icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white leading-tight">{badge.title}</p>
        {badge.description ? <p className="text-xs text-slate-300/90 mt-0.5 leading-relaxed">{badge.description}</p> : null}
      </div>
    </div>
  )
}

const ShieldIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[420px] sm:max-w-[520px] mx-auto lg:mx-0">
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 w-[380px] h-[380px] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute -bottom-14 right-0 w-[260px] h-[260px] rounded-full bg-blue-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur p-5 sm:p-7 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none opacity-70" style={{
          backgroundImage:
            'radial-gradient(ellipse at top left, rgba(59,130,246,0.35), transparent 55%), radial-gradient(ellipse at bottom right, rgba(34,211,238,0.22), transparent 60%)',
        }} />
        <div className="absolute -left-16 top-10 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute -right-16 -bottom-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-semibold">
              <Shield size={14} className="text-blue-200" />
              Sentinel Edge Shield
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300/90">
              <Zap size={14} className="text-cyan-200" />
              Live protection
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="relative w-[230px] h-[230px]">
              <motion.div
                className="absolute inset-0 rounded-full bg-cyan-500/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                style={{ filter: 'blur(1px)' }}
              />
              <motion.div
                className="absolute inset-4 rounded-full bg-blue-500/10"
                animate={{ rotate: -360 }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-blue-500/15 to-transparent flex items-center justify-center">
                  <div className="w-[150px] h-[150px] rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center">
                    <div className="w-[84px] h-[84px] rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <ShieldCheck className="text-blue-200" size={40} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 top-4 w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-8 w-36 h-1 rounded-full bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

              {/* corner signals */}
              <div className="absolute left-4 top-5 w-2.5 h-2.5 rounded-full bg-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.45)]" />
              <div className="absolute right-4 top-7 w-2.5 h-2.5 rounded-full bg-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.45)]" />
              <div className="absolute left-6 bottom-6 w-2.5 h-2.5 rounded-full bg-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.45)]" />
              <div className="absolute right-6 bottom-10 w-2.5 h-2.5 rounded-full bg-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.45)]" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[{ t: 'No Setup Fees', i: <Zap size={16} className="text-cyan-200" /> },
              { t: 'Cancel Anytime', i: <XCircle size={16} className="text-blue-200" /> },
              { t: 'Enterprise Grade', i: <Bell size={16} className="text-cyan-200" /> },
              { t: '24/7 Support', i: <PhoneCall size={16} className="text-blue-200" /> }].map((x) => (
              <div key={x.t} className="rounded-2xl bg-white/[0.03] border border-white/10 px-3 py-2">
                <div className="flex items-center gap-2">
                  {x.i}
                  <p className="text-xs font-semibold text-slate-200">{x.t}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function PricingHero() {
  const trustBadges: TrustBadge[] = [
    {
      title: 'No Setup Fees',
      description: 'Start immediately—no hidden costs.',
      icon: <Zap size={18} />,
    },
    {
      title: 'Cancel Anytime',
      description: 'Flexible subscriptions for growing teams.',
      icon: <XCircle size={18} />,
    },
    {
      title: 'Enterprise Grade Security',
      description: 'Audit-ready access control & secure logging.',
      icon: <ShieldCheck size={18} />,
    },
    {
      title: '24/7 Support',
      description: 'Fast escalation with dedicated security specialists.',
      icon: <PhoneCall size={18} />,
    },
  ]

  return (
    <section id="pricing" className="relative pt-24 pb-10 sm:pb-14 overflow-x-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none" style={{
        background:
          'radial-gradient(1000px circle at 20% 0%, rgba(59,130,246,0.22), transparent 55%), radial-gradient(900px circle at 80% 20%, rgba(34,211,238,0.16), transparent 55%)',
      }} />
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.22]" style={{
        backgroundImage:
          'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-semibold"
            >
              <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
              Pricing Plans
            </motion.div>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              Simple, Transparent <span className="text-cyan-200">Pricing</span>
            </h1>

            <p className="mt-5 text-slate-300/95 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl">
              Secure deployments for edge intelligence, identity verification, and audit-grade visibility—priced to scale with
              your organization.
            </p>

            <div className="mt-7 grid sm:grid-cols-2 gap-3">
              {trustBadges.map((b) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45 }}
                >
                  <TrustBadgeItem badge={b} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <ShieldIllustration />
          </div>
        </div>
      </div>
    </section>
  )
}

