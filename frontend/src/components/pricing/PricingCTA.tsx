import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'


export default function PricingCTA() {
  return (
    <section className="mt-10 sm:mt-14 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.99 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-white/[0.02] backdrop-blur p-6 sm:p-10"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(700px circle at 15% 0%, rgba(59,130,246,0.22), transparent 55%), radial-gradient(600px circle at 90% 20%, rgba(34,211,238,0.18), transparent 60%)',
            }}
          />
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-28 -left-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-semibold">
                <ShieldCheck size={14} className="text-blue-200" />
                Premium cybersecurity pricing
              </div>
              <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">Ready to secure your organization?</h2>
              <p className="mt-3 text-slate-300/90 text-sm sm:text-base leading-relaxed max-w-2xl">
                Start with a free trial, then scale to enterprise-grade security with dedicated infrastructure and SLAs.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <motion.a
                  whileHover={{ scale: 1.03, boxShadow: '0 0 35px rgba(59,130,246,0.35)' }}
                  whileTap={{ scale: 0.98 }}
                  href="/register"
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 border border-cyan-300/20 shadow-lg shadow-blue-600/25 text-white text-center"
                >
                  Start Free Trial
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  href="#"
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-white/[0.03] border border-white/10 hover:border-cyan-400/30 text-slate-200 text-center"
                >
                  Talk to Sales
                </motion.a>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[{ t: 'No setup fees' }, { t: 'Cancel anytime' }, { t: '24×7 support' }].map((x) => (
                  <div key={x.t} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300/70" />
                    <span className="text-xs text-slate-300/95 font-semibold">{x.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

