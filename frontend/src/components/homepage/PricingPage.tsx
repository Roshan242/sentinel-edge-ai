import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import PricingHero from '@/components/pricing/PricingHero'
import BillingToggle, { type BillingCadence } from '@/components/pricing/BillingToggle'
import PricingCards, { defaultPlans } from '@/components/pricing/PricingCards'
import ComparisonTable from '@/components/pricing/ComparisonTable'
import EnterpriseBenefits from '@/components/pricing/EnterpriseBenefits'
import PricingFAQ from '@/components/pricing/PricingFAQ'
import PricingCTA from '@/components/pricing/PricingCTA'


const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#020817] text-white overflow-x-hidden">
    {children}
  </div>
)

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 5C7 5 3 12 3 12s4 7 9 7 9-7 9-7-4-7-9-7z" stroke="white" strokeWidth="1.5" fill="none" />
                  <circle cx="12" cy="12" r="3" fill="white" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-white tracking-wide leading-tight">Sentinel Edge AI</p>
                <p className="text-xs text-slate-400 leading-tight">Premium security SaaS</p>
              </div>
            </div>
            <p className="mt-4 text-slate-300/90 text-sm leading-relaxed max-w-sm">
              Enterprise-grade protection for edge intelligence, identity verification, and audit-grade security analytics.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 lg:col-span-8 gap-8">
            {[
              {
                title: 'Product',
                links: ['Pricing', 'Security', 'Integrations', 'API Access'],
              },
              {
                title: 'Resources',
                links: ['Docs', 'Guides', 'Status', 'Changelog'],
              },
              {
                title: 'Company',
                links: ['About', 'Careers', 'Contact', 'Security'],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-sm font-bold text-white">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-slate-300/90 hover:text-cyan-200 transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Sentinel Edge AI. All rights reserved. Enterprise security with modern UX.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur p-4">
              <p className="text-sm font-bold text-white">Newsletter</p>
              <p className="mt-1 text-xs text-slate-400">Security updates and product releases.</p>
              <form className="mt-3 flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
                <label className="sr-only" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="flex-1 bg-[#0b1220]/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50"
                  placeholder="you@company.com"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 border border-cyan-300/20"
                >
                  Subscribe
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                <a href="#" className="hover:text-cyan-200 transition-colors">Privacy</a>
                <a href="#" className="hover:text-cyan-200 transition-colors">Terms</a>
                <a href="#" className="hover:text-cyan-200 transition-colors">Legal</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function PricingPage() {
  const navigate = useNavigate()
  const [cadence, setCadence] = useState<BillingCadence>('monthly')

  const plans = useMemo(() => defaultPlans, [])

  const handleSelectPlan = (planId: 'starter' | 'professional' | 'enterprise') => {
    if (planId === 'enterprise') {
      navigate('/register')
      return
    }
    navigate('/register')
  }

  return (
    <PageContainer>
      {/* sticky in-page navbar */}
      <motion.div
        initial={{ y: -18, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: false }}
        className="sticky top-0 z-40 border-b border-white/5 backdrop-blur bg-[#020817]/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600/40 border border-blue-500/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 5C7 5 3 12 3 12s4 7 9 7 9-7 9-7-4-7-9-7z" stroke="white" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold">Pricing Plans</p>
              <p className="text-xs text-slate-400">Sentinel Edge AI</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="#comparison" className="text-sm text-slate-300/90 hover:text-cyan-200 transition-colors">
              Compare
            </a>
            <a href="#faq" className="text-sm text-slate-300/90 hover:text-cyan-200 transition-colors">
              FAQ
            </a>
            <a
              href="/register"
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-blue-600/25"
            >
              Start Trial
            </a>
          </div>
        </div>
      </motion.div>

      <PricingHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 sm:-mt-4">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur p-5 sm:p-6"
        >
          <BillingToggle value={cadence} onChange={setCadence} />

          <AnimatePresence mode="wait">
            <motion.div
              key={cadence}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <p className="mt-4 text-xs sm:text-sm text-slate-400">
                Prices update instantly when you switch between monthly and yearly billing.
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="mt-6" />

        <PricingCards cadence={cadence} plans={plans} onSelectPlan={handleSelectPlan} />
      </div>

      <div id="comparison" />
      <ComparisonTable plans={plans} cadence={cadence} />

      <EnterpriseBenefits />

      <div id="faq" />
      <PricingFAQ />

      <PricingCTA />
      <Footer />
    </PageContainer>
  )
}

