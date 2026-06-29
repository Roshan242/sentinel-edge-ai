import { motion } from 'framer-motion'
import { Check, Database, Users, Cpu } from 'lucide-react'

import type { BillingCadence } from './BillingToggle'

export type Plan = {
  id: 'starter' | 'professional' | 'enterprise'
  name: string
  description: string
  monthlyPriceINR: number | null
  yearlyPriceINR: number | null // per month when billed yearly (so monthly equivalent)
  highlight?: boolean
  ctaLabel: string
  cameraLimit: string
  features: string[]
  footnote?: string
}

const FeatureLine = ({ text }: { text: string }) => (

  <div className="flex items-start gap-2 text-slate-200/95 text-sm">
    <Check size={16} className="mt-0.5 text-emerald-300" />
    <span>{text}</span>
  </div>
)

export default function PricingCards({
  cadence,
  plans,
  onSelectPlan,
}: {
  cadence: BillingCadence
  plans: Plan[]
  onSelectPlan: (planId: Plan['id']) => void
}) {
  return (
    <div className="mt-8 grid md:grid-cols-3 gap-4 auto-rows-fr">
      {plans.map((p) => {
        const price = cadence === 'monthly' ? p.monthlyPriceINR : p.yearlyPriceINR
        const isEnterprise = p.id === 'enterprise'

        return (
          <motion.div
            key={p.id}
            layout
            className={
              'h-full relative rounded-3xl border backdrop-blur overflow-hidden ' +
              (p.highlight
                ? 'border-cyan-400/35 bg-white/[0.04] shadow-[0_0_40px_rgba(34,211,238,0.18)]'
                : 'border-white/10 bg-white/[0.02]')
            }
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
          >
            {p.highlight ? (
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[340px] h-[220px] rounded-full bg-cyan-500/10 blur-3xl" />
                <div className="absolute inset-0 border border-cyan-300/20 rounded-3xl" />
              </div>
            ) : null}

            <div className="relative p-6 h-full flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-slate-300/90">{p.description}</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">{p.name}</h3>
                </div>
                {p.highlight ? (
                  <div className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-200 text-xs font-bold">
                    Most Popular
                  </div>
                ) : null}
              </div>

              <div className="mt-5">
                {!isEnterprise ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-extrabold text-white">
                        ₹{price}
                      </p>
                      <p className="text-sm text-slate-300/90 font-semibold">/month</p>
                    </div>
                    {cadence === 'yearly' ? (
                      <p className="mt-1 text-xs text-cyan-200/90">Billed yearly. Price shown per month.</p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-300/90">Monthly billing. Cancel anytime.</p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-extrabold text-white">Contact</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-300/90">Tailored infrastructure and SLAs for enterprise teams.</p>
                  </>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    {p.id === 'starter' ? (
                      <Cpu size={18} className="text-blue-200" />
                    ) : p.id === 'professional' ? (
                      <Users size={18} className="text-cyan-200" />
                    ) : (
                      <Database size={18} className="text-blue-200" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-300/90">Included</p>
                    <p className="text-sm font-semibold text-white">{p.cameraLimit}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {p.features.map((f) => (
                  <FeatureLine key={f} text={f} />
                ))}
              </div>

              <div className="mt-auto pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectPlan(p.id)}
                  className={
                    'w-full py-3.5 rounded-2xl font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ' +
                    (p.highlight
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/25 border border-cyan-300/20'
                      : isEnterprise
                        ? 'bg-white/[0.03] border border-white/10 text-slate-200 hover:border-cyan-400/30'
                        : 'bg-white/[0.02] border border-white/10 text-slate-200 hover:border-blue-500/30')
                  }
                >
                  {p.ctaLabel}
                </motion.button>
                {p.footnote ? <p className="mt-3 text-xs text-slate-400">{p.footnote}</p> : null}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export const defaultPlans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small deployments',
    monthlyPriceINR: 499,
    yearlyPriceINR: 399, // 20% savings (approx). Shows per month billed yearly.
    cameraLimit: 'Up to 2 Cameras',
    features: ['AI Motion Detection', 'Live Access Logs', 'Email Alerts', 'Basic Dashboard'],
    ctaLabel: 'Start Trial',
    footnote: 'No setup fees • Cancel anytime',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Most teams choose this',
    monthlyPriceINR: 1499,
    yearlyPriceINR: 1199, // 20% savings approx
    cameraLimit: 'Up to 10 Cameras',
    features: ['Advanced AI Detection', 'Biometric Access Control', 'Analytics Dashboard', 'Priority Support', 'Custom Alerts'],
    ctaLabel: 'Start Trial',
    highlight: true,
    footnote: 'Best value for security operations',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Scale with dedicated infrastructure',
    monthlyPriceINR: null,
    yearlyPriceINR: null,
    cameraLimit: 'Unlimited Cameras',
    features: ['Unlimited Users', 'Dedicated Infrastructure', 'API Access', 'Custom AI Models', 'SLA', '24×7 Support'],
    ctaLabel: 'Contact Sales',
    footnote: 'Enterprise-grade security & compliance workflows',
  },
]

